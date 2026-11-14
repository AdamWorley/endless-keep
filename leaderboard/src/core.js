// Endless Keep shared leaderboard — the whole API, written against standard web Request/Response so it runs on
// Cloudflare Workers, Deno, Bun, Node 18+ (with a tiny adapter), Vercel/Netlify edge functions, etc.
// Storage is passed in as a small adapter (see store-d1.js), so changing provider means swapping that one file.
//
//   GET  /scores?v=N      -> { v, scores: [{ name, best, at, badges }] }   top 50 for rules version N
//   GET  /versions        -> { versions: [{ v, players }] }                 which boards exist
//   POST /scores          <- { token, name, level, v, badges }              saves your best level for version v
//   GET  /health          -> { ok: true }
// Each rules version (bumped by the game whenever balance changes make it easier or harder) has its own board.
import { cleanName, isProfane } from "./names.js";

const BADGES = new Set(["lv10", "lv25", "lv50", "lv100", "trollking", "bigdragon", "wyrm", "untouched", "greatwyrm", "lumberjack", "rich", "architect", "frosty", "namesake", "whisperer"]);
const MAX_LEVEL = 5000;
const MAX_VERSION = 999;
const isVer = v => Number.isInteger(v) && v >= 1 && v <= MAX_VERSION;
const MAX_BODY = 1024;           // bytes
const POSTS_PER_MINUTE = 20;     // per IP
const PLAYER_COOLDOWN = 5;       // seconds between saves for one player

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
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// opts: { store, origins: string[], salt: string, ip: string, now?: () => ms }
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
  if (url.pathname !== "/scores") return reply(404, { error: "not_found" }, cors);

  if (request.method === "OPTIONS") {
    if (!allowed) return reply(403, { error: "origin" });
    return reply(204, null, { ...cors, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" });
  }

  if (request.method === "GET") {
    const vs = url.searchParams.get("v"), v = vs !== null && /^\d{1,3}$/.test(vs) ? Number(vs) : NaN;
    if (!isVer(v)) return reply(400, { error: "version" }, cors);
    const rows = await store.top(50, v);
    const scores = rows.map(r => ({ name: r.name, best: r.best, at: r.best_at, badges: safeBadges(r.badges) }));
    return reply(200, { v, scores }, { ...cors, "Cache-Control": "public, max-age=10" });
  }

  if (request.method !== "POST") return reply(405, { error: "method" }, { ...cors, Allow: "GET, POST, OPTIONS" });

  // writes are only accepted from the game's own pages
  if (!allowed) return reply(403, { error: "origin" }, cors);
  if (!(request.headers.get("Content-Type") || "").toLowerCase().startsWith("application/json")) return reply(415, { error: "content_type" }, cors);
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > MAX_BODY) return reply(413, { error: "too_large" }, cors);

  // rate limit by (hashed) IP, per minute
  const ipKey = (await sha256Hex(salt + "|ip|" + (opts.ip || "unknown"))).slice(0, 32);
  const minute = Math.floor(now / 60000);
  if ((await store.hit(ipKey, minute)) > POSTS_PER_MINUTE) return reply(429, { error: "slow_down" }, { ...cors, "Retry-After": "60" });
  if (Math.random() < .02) await store.prune(minute - 5);

  let raw;
  try { raw = await request.text(); } catch { return reply(400, { error: "body" }, cors); }
  if (raw.length > MAX_BODY) return reply(413, { error: "too_large" }, cors);
  let data;
  try { data = JSON.parse(raw); } catch { return reply(400, { error: "json" }, cors); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return reply(400, { error: "json" }, cors);

  const { token, level, v } = data;
  if (typeof token !== "string" || !/^[a-f0-9]{32}$/.test(token)) return reply(400, { error: "token" }, cors);
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return reply(400, { error: "level" }, cors);
  if (!isVer(v)) return reply(400, { error: "version" }, cors);
  const name = cleanName(data.name);
  if (!name) return reply(422, { error: "name_invalid" }, cors);
  if (isProfane(name)) return reply(422, { error: "name_not_allowed" }, cors);
  const badges = Array.isArray(data.badges) ? [...new Set(data.badges.filter(b => typeof b === "string" && BADGES.has(b)))].slice(0, BADGES.size) : [];

  // the player id is a hash of their secret token, so nobody can overwrite someone else's entry
  const id = (await sha256Hex(salt + "|player|" + token)).slice(0, 40);
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
