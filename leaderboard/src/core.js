// Endless Keep shared leaderboard — the whole API, written against standard web Request/Response so it runs on
// Cloudflare Workers, Deno, Bun, Node 18+ (with a tiny adapter), Vercel/Netlify edge functions, etc.
// Storage is passed in as a small adapter (see store-d1.js), so changing provider means swapping that one file.
//
//   GET  /scores?v=N      -> { v, scores: [{ name, best, at, badges }] }   top 50 for rules version N
//   GET  /versions        -> { versions: [{ v, players }] }                 which boards exist
//   POST /runs            <- { token, v, human? }  -> { ticket }           start a run (human = Turnstile token, if enabled)
//   POST /scores          <- { token, ticket, name, level, v, badges }      saves your best level for version v
//   GET  /health          -> { ok: true }
// Each rules version (bumped by the game whenever balance changes make it easier or harder) has its own board.
//
// Run tickets: a score must carry the signed ticket its run got from POST /runs, and the level it claims must not
// have come sooner than the game allows (every wave takes real time to send its monsters, even at 3x speed). The
// ticket is signed with a key derived from HASH_SALT, so it can't be forged, and it's tied to one player and version.
import { cleanName, isProfane } from "./names.js";

const BADGES = new Set(["lv10", "lv25", "lv50", "lv100", "trollking", "bigdragon", "wyrm", "untouched", "greatwyrm", "lumberjack", "rich", "architect", "frosty", "namesake", "whisperer",
  "laststand", "allfive", "toplevel", "fortress", "greenthumb", "eventful", "scholar", "slayer"]);
const MAX_LEVEL = 5000;
const MAX_VERSION = 999;
const isVer = v => Number.isInteger(v) && v >= 1 && v <= MAX_VERSION;
const MAX_BODY = 1024;           // bytes
const POSTS_PER_MINUTE = 20;     // per IP
const PLAYER_COOLDOWN = 5;       // seconds between saves for one player
const RUNS_PER_MINUTE = 10;      // per IP
const RUN_BODY = 4096;           // a Turnstile token can be up to 2048 characters

// The quickest a wave can possibly finish, in real seconds. Mirrors makeWave() in the game: monsters arrive `gap`
// game-seconds apart (from 0.5s in), paying the goblin toll removes 30% of them (from level 4, not on boss levels),
// and the game runs at most 3x real time. The 0.8 leaves slack for rounding and clock differences.
// Must be kept in step with the game's wave rules (they only change with a RULES_VERSION bump).
function fastestWave(L) {
  const boss = L % 10 === 0;
  let n = Math.min(8 + Math.floor(L * 0.9), 45) - (boss ? 4 : 0);
  if (L >= 4 && !boss) n -= Math.round(n * 0.3);
  const gap = Math.max(0.38, 1.0 - L * 0.01);
  return (0.5 + (n + (boss ? 1 : 0) - 1) * gap) / 3 * 0.8;
}
const MIN_MS = [0];              // MIN_MS[L] = fewest milliseconds from the start of a run to clearing level L
for (let L = 1; L <= MAX_LEVEL; L++) MIN_MS[L] = MIN_MS[L - 1] + fastestWave(L) * 1000;
export const minRunMs = L => MIN_MS[Math.min(MAX_LEVEL, Math.max(0, L))];

const BASE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "interest-cohort=()",
  "X-Frame-Options": "DENY",
};

function reply(status, body, extra = {}) {
  return new Response(body === null ? null : JSON.stringify(body), { status, headers: { ...BASE_HEADERS, "Cache-Control": "no-store", ...extra } });
}
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
async function sha256Hex(text) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}
const ticketKey = salt => crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + "|ticket"))
  .then(raw => crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]));
// ticket = "<player id prefix>.<version>.<start ms>.<hmac>"
async function makeTicket(salt, pid, v, t) {
  const body = `${pid}.${v}.${t}`;
  return body + "." + hex(await crypto.subtle.sign("HMAC", await ticketKey(salt), new TextEncoder().encode(body)));
}
async function readTicket(salt, ticket) {
  const m = typeof ticket === "string" && /^([a-f0-9]{16})\.(\d{1,3})\.(\d{13})\.([a-f0-9]{64})$/.exec(ticket);
  if (!m) return null;
  const sig = new Uint8Array(m[4].match(/../g).map(h => parseInt(h, 16)));
  const ok = await crypto.subtle.verify("HMAC", await ticketKey(salt), sig, new TextEncoder().encode(`${m[1]}.${m[2]}.${m[3]}`));
  return ok ? { pid: m[1], v: Number(m[2]), t: Number(m[3]) } : null;
}

// opts: { store, origins: string[], salt: string, ip: string, now?: () => ms,
//         verifyHuman?: (token, ip) => Promise<boolean>   (Turnstile; when given, starting a run needs a passing token) }
export async function handle(request, opts) {
  const { store, origins, salt } = opts;
  const now = opts.now ? opts.now() : Date.now();
  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  const allowed = origin && origins.includes(origin);
  const cors = allowed ? { "Access-Control-Allow-Origin": origin, "Vary": "Origin" } : { "Vary": "Origin" };

  if (url.pathname === "/health" && request.method === "GET") return reply(200, { ok: true }, cors);
  if (url.pathname === "/versions" && request.method === "GET") {
    const rows = await store.versions();
    return reply(200, { versions: rows.map(r => ({ v: r.ver, players: r.players })) }, { ...cors, "Cache-Control": "public, max-age=30" });
  }
  if (url.pathname !== "/scores" && url.pathname !== "/runs") return reply(404, { error: "not_found" }, cors);
  const runs = url.pathname === "/runs";

  if (request.method === "OPTIONS") {
    if (!allowed) return reply(403, { error: "origin" });
    return reply(204, null, { ...cors, "Access-Control-Allow-Methods": runs ? "POST, OPTIONS" : "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" });
  }

  if (request.method === "GET" && !runs) {
    const vs = url.searchParams.get("v"), v = vs !== null && /^\d{1,3}$/.test(vs) ? Number(vs) : NaN;
    if (!isVer(v)) return reply(400, { error: "version" }, cors);
    const rows = await store.top(50, v);
    const scores = rows.map(r => ({ name: r.name, best: r.best, at: r.best_at, badges: safeBadges(r.badges) }));
    return reply(200, { v, scores }, { ...cors, "Cache-Control": "public, max-age=10" });
  }

  if (request.method !== "POST") return reply(405, { error: "method" }, { ...cors, Allow: runs ? "POST, OPTIONS" : "GET, POST, OPTIONS" });
  if (!salt) return reply(503, { error: "not_configured" }, cors);   // without a secret salt, tickets could be forged
  const maxBody = runs ? RUN_BODY : MAX_BODY;

  // writes are only accepted from the game's own pages
  if (!allowed) return reply(403, { error: "origin" }, cors);
  if (!(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) return reply(415, { error: "content_type" }, cors);
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > maxBody) return reply(413, { error: "too_large" }, cors);

  // rate limit by (hashed) IP, per minute (runs and scores counted separately)
  const ipKey = (await sha256Hex(salt + (runs ? "|run|" : "|ip|") + (opts.ip || "unknown"))).slice(0, 32);
  const minute = Math.floor(now / 60000);
  if ((await store.hit(ipKey, minute)) > (runs ? RUNS_PER_MINUTE : POSTS_PER_MINUTE)) return reply(429, { error: "slow_down" }, { ...cors, "Retry-After": "60" });
  if (Math.random() < .02) await store.prune(minute - 5);

  let raw;
  try { raw = await request.text(); } catch { return reply(400, { error: "body" }, cors); }
  if (raw.length > maxBody) return reply(413, { error: "too_large" }, cors);
  let data;
  try { data = JSON.parse(raw); } catch { return reply(400, { error: "json" }, cors); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return reply(400, { error: "json" }, cors);

  const { token, level, v } = data;
  if (typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token)) return reply(400, { error: "token" }, cors);
  // the player id is a hash of their secret token, so nobody can overwrite someone else's entry
  const id = (await sha256Hex(salt + "|player|" + token)).slice(0, 40);

  if (runs) {
    if (!isVer(v)) return reply(400, { error: "version" }, cors);
    if (opts.verifyHuman) {
      const human = data.human;
      if (typeof human !== "string" || !human || human.length > 2048 || !(await opts.verifyHuman(human, opts.ip))) return reply(403, { error: "human" }, cors);
    }
    return reply(200, { ticket: await makeTicket(salt, id.slice(0, 16), v, now) }, cors);
  }

  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return reply(400, { error: "level" }, cors);
  if (!isVer(v)) return reply(400, { error: "version" }, cors);
  const tk = await readTicket(salt, data.ticket);
  if (!tk || tk.pid !== id.slice(0, 16) || tk.v !== v || tk.t > now) return reply(403, { error: "ticket" }, cors);
  if (now - tk.t < minRunMs(level)) return reply(403, { error: "too_fast" }, cors);
  const name = cleanName(data.name);
  if (!name) return reply(422, { error: "name_invalid" }, cors);
  if (isProfane(name)) return reply(422, { error: "name_not_allowed" }, cors);
  const badges = Array.isArray(data.badges) ? [...new Set(data.badges.filter(b => typeof b === "string" && BADGES.has(b)))].slice(0, BADGES.size) : [];

  const cur = await store.get(id, v);
  if (cur && now - cur.updated < PLAYER_COOLDOWN * 1000) return reply(429, { error: "slow_down" }, { ...cors, "Retry-After": String(PLAYER_COOLDOWN) });
  const best = Math.max(cur ? cur.best : 0, level);
  const bestAt = cur && cur.best >= level ? cur.best_at : now;
  const merged = [...new Set([...(cur ? safeBadges(cur.badges) : []), ...badges])];
  await store.put({ id, ver: v, name, best, best_at: bestAt, badges: JSON.stringify(merged), updated: now });
  return reply(200, { ok: true, name, best, v }, cors);
}

function safeBadges(v) {
  try { const a = typeof v === "string" ? JSON.parse(v) : v; return Array.isArray(a) ? a.filter(b => BADGES.has(b)) : []; } catch { return []; }
}
