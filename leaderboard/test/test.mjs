// Run: npm test   — exercises the API with an in-memory store (no network, no Cloudflare needed)
import { handle } from "../src/core.js";
import { cleanName, isProfane } from "../src/names.js";
import assert from "node:assert/strict";

function memStore() {
  const players = new Map(), hits = new Map();
  return {
    async top(n, ver) { return [...players.values()].filter(p => p.ver === ver && p.best > 0).sort((a, b) => b.best - a.best || a.best_at - b.best_at).slice(0, n); },
    async versions() { const m = new Map(); for (const p of players.values()) m.set(p.ver, (m.get(p.ver) || 0) + 1); return [...m].map(([ver, n]) => ({ ver, players: n })); },
    async get(id, ver) { return players.get(id + "@" + ver) || null; },
    async put(p) { const c = players.get(p.id + "@" + p.ver); players.set(p.id + "@" + p.ver, { ...p, best: Math.max(c ? c.best : 0, p.best) }); },
    async hit(k, w) { const key = k + ":" + w; hits.set(key, (hits.get(key) || 0) + 1); return hits.get(key); },
    async prune() {},
    players,
  };
}
const ORIGIN = "https://adamworley.github.io";
let clock = 1_000_000;
const store = memStore();
const opts = (ip = "1.2.3.4") => ({ store, origins: [ORIGIN], salt: "test-salt", ip, now: () => clock });
const tok = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join("");
// every post is for rules version 1 unless the test says otherwise
const post = (body, { origin = ORIGIN, ip, type = "application/json", raw } = {}) =>
  handle(new Request("https://lb.example/scores", { method: "POST", headers: { "Content-Type": type, ...(origin ? { Origin: origin } : {}) },
    body: raw ?? JSON.stringify(body && typeof body === "object" && !Array.isArray(body) && !("v" in body) ? { ...body, v: 1 } : body) }), opts(ip));
const get = (origin = ORIGIN, v = 1) => handle(new Request("https://lb.example/scores?v=" + v, { headers: origin ? { Origin: origin } : {} }), opts());
let pass = 0; const t = async (name, fn) => { await fn(); pass++; console.log("ok -", name); };

await t("names are cleaned", () => {
  assert.equal(cleanName("  Queen   of Keep  "), "Queen of Keep");
  assert.equal(cleanName("<script>alert(1)</script>"), "scriptalert1scri");
  assert.equal(cleanName('"><img src=x onerror=alert(1)>'), "img srcx onerror");
  assert.equal(cleanName("a‮evil​"), "aevil");               // bidi override + zero-width removed
  assert.ok(!/\p{M}{3}/u.test(cleanName("z" + "\u0301\u0302\u0303\u0304\u0305".repeat(8)))); // zalgo trimmed
  assert.equal(cleanName("x".repeat(40)).length, 16);
  assert.equal(cleanName("!!!"), "");
  assert.equal(cleanName(42), "");
  assert.equal(cleanName("Ｆｕｌｌｗｉｄｔｈ"), "Fullwidth");
});
await t("profanity filter catches tricks but not innocent names", () => {
  for (const bad of ["fuck", "FuCk3r", "f u c k", "fuuuuck", "sh1t", "$h!t", "biatch", "a s s", "Big Ass", "c0ck", "n1gg4", "R4pe"]) assert.ok(isProfane(bad), bad);
  for (const ok of ["Classic", "Assassin", "Title Bout", "Grapefruit", "Peacock", "Scunthorpe", "Cocktail Hour", "Bass Player", "Spicy", "Dickens", "Hancock", "Queen of Keep", "Ember", "Knight Rider", "Nightshade", "Bollinger"]) assert.ok(!isProfane(ok), ok);
});
await t("valid score is saved and listed", async () => {
  const r = await post({ token: tok(), name: "Ada", level: 12, badges: ["lv10", "<b>x</b>", "rich"] });
  assert.equal(r.status, 200);
  const g = await (await get()).json();
  assert.deepEqual(g.scores[0], { name: "Ada", best: 12, at: clock, badges: ["lv10", "rich"] });
});
await t("XSS payload names are stored only as harmless text", async () => {
  clock += 10000;
  const r = await post({ token: tok(), name: "<img src=x onerror=alert(1)>", level: 3 });
  assert.equal(r.status, 200);
  const g = await (await get()).json();
  assert.ok(g.scores.every(s => !/[<>"&]/.test(s.name)));
});
await t("profane names are refused", async () => {
  const r = await post({ token: tok(), name: "sh1tlord", level: 3 }, { ip: "9.9.9.1" });
  assert.equal(r.status, 422); assert.equal((await r.json()).error, "name_not_allowed");
});
await t("bad input is refused without echoing it", async () => {
  const cases = [
    [{ token: "nope", name: "A", level: 1 }, 400], [{ token: tok(), name: "A", level: 0 }, 400], [{ token: tok(), name: "A", level: 1.5 }, 400],
    [{ token: tok(), name: "A", level: 99999 }, 400], [{ token: tok(), name: "A", level: "5" }, 400], [{ token: tok(), name: "", level: 2 }, 422],
    [[1, 2, 3], 400], [{ token: tok(), name: { x: 1 }, level: 2 }, 422],
  ];
  for (const [body, code] of cases) { const r = await post(body, { ip: "5.5.5." + code }); assert.equal(r.status, code, JSON.stringify(body)); assert.ok(!(await r.text()).includes("nope")); }
  assert.equal((await post(null, { raw: "{not json", ip: "6.6.6.6" })).status, 400);
  assert.equal((await post(null, { raw: "x".repeat(5000), ip: "6.6.6.7" })).status, 413);
  assert.equal((await post({ token: tok(), name: "A", level: 2 }, { type: "text/plain", ip: "6.6.6.8" })).status, 415);
});
await t("SQL-ish names are just text", async () => {
  clock += 10000;
  const r = await post({ token: tok(), name: "Robert'); DROP TABLE players;--", level: 4 }, { ip: "7.7.7.7" });
  assert.equal(r.status, 200);
  assert.equal((await r.json()).name, "Robert' DROP TAB");
});
await t("writes from other sites are refused; CORS only for the game", async () => {
  assert.equal((await post({ token: tok(), name: "Eve", level: 50 }, { origin: "https://evil.example" })).status, 403);
  assert.equal((await post({ token: tok(), name: "Eve", level: 50 }, { origin: null })).status, 403);
  const g = await get("https://evil.example");
  assert.equal(g.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal((await get()).headers.get("Access-Control-Allow-Origin"), ORIGIN);
});
await t("security headers on every response", async () => {
  for (const r of [await get(), await post({}, { ip: "8.8.8.8" }), await handle(new Request("https://lb.example/nope"), opts())]) {
    assert.equal(r.headers.get("X-Content-Type-Options"), "nosniff");
    assert.match(r.headers.get("Content-Security-Policy"), /default-src 'none'/);
    assert.match(r.headers.get("Content-Type"), /application\/json/);
  }
});
await t("a player can only raise their own best, and can't be impersonated", async () => {
  clock += 10000; const me = tok();
  await post({ token: me, name: "Bo", level: 20 }, { ip: "2.2.2.1" });
  clock += 10000; await post({ token: me, name: "Bo", level: 5 }, { ip: "2.2.2.1" });
  let g = await (await get()).json(); assert.equal(g.scores.find(s => s.name === "Bo").best, 20);
  clock += 10000; await post({ token: tok(), name: "Bo", level: 1 }, { ip: "2.2.2.2" });   // same name, different player
  g = await (await get()).json(); assert.equal(g.scores.filter(s => s.name === "Bo").length, 2);
  assert.equal(g.scores.find(s => s.name === "Bo").best, 20);
});
await t("rate limits: per player cooldown and per IP", async () => {
  const me = tok(); clock += 60000;
  assert.equal((await post({ token: me, name: "Cy", level: 2 }, { ip: "3.3.3.3" })).status, 200);
  assert.equal((await post({ token: me, name: "Cy", level: 3 }, { ip: "3.3.3.3" })).status, 429);
  let last; for (let i = 0; i < 25; i++) last = await post({ token: tok(), name: "Spam", level: 1 }, { ip: "4.4.4.4" });
  assert.equal(last.status, 429);
});
await t("other methods and paths are refused", async () => {
  assert.equal((await handle(new Request("https://lb.example/scores", { method: "DELETE", headers: { Origin: ORIGIN } }), opts())).status, 405);
  assert.equal((await handle(new Request("https://lb.example/admin"), opts())).status, 404);
});
await t("each rules version has its own board", async () => {
  clock += 60000; const me = tok();
  assert.equal((await post({ token: me, name: "Dee", level: 40, v: 2 }, { ip: "11.0.0.1" })).status, 200);
  clock += 10000; assert.equal((await post({ token: me, name: "Dee", level: 8, v: 1 }, { ip: "11.0.0.1" })).status, 200);
  const v1 = await (await get(ORIGIN, 1)).json(), v2 = await (await get(ORIGIN, 2)).json();
  assert.equal(v1.scores.find(s => s.name === "Dee").best, 8);
  assert.deepEqual(v2.scores.map(s => s.name), ["Dee"]);
  const vers = await (await handle(new Request("https://lb.example/versions"), opts())).json();
  assert.ok(vers.versions.some(x => x.v === 2 && x.players === 1));
  for (const bad of [0, 1000, "2", 1.5, null]) assert.equal((await post({ token: tok(), name: "Eli", level: 3, v: bad }, { ip: "11.0.0.9" })).status, 400, String(bad));
  for (const q of ["", "?v=", "?v=abc", "?v=0", "?v=1000", "?v=1;DROP"]) assert.equal((await handle(new Request("https://lb.example/scores" + q), opts())).status, 400, q);
});
console.log(`\n${pass} checks passed`);
