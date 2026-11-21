// CI sanity check of a build: the page's inline script must parse, and the build must carry every file the
// service worker caches. Usage: node pwa/check.mjs dist
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2] || "dist", html = readFileSync(join(dir, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length < 2) throw new Error(`expected the service-worker and game scripts, found ${scripts.length}`);
scripts.forEach((code, i) => { try { new Function(code); } catch (e) { throw new Error(`inline script ${i + 1} doesn't parse: ${e.message}`); } });
const sw = readFileSync(join(dir, "sw.js"), "utf8");
if (sw.includes("endless-keep-v1")) throw new Error("sw.js cache name wasn't bumped");
const shell = JSON.parse(sw.match(/const SHELL = (\[[^\]]*\])/)[1]).filter(f => f !== "./");
for (const f of shell) if (!existsSync(join(dir, f))) throw new Error(`missing ${f}`);
const ver = html.match(/GAME_VERSION = "([^"]+)", RULES_VERSION = (\d+)/);
console.log(`OK: ${scripts.length} scripts parse, ${shell.length} cached files present, game ${ver?.[1]} rules ${ver?.[2]}`);

// A saved game must load back exactly: a bot plays 45 levels, saves, a fresh game restores it, and its save must match.
// (makeSave and restore are written field by field, so a field added to one and not the other would be lost quietly.)
const { loadGame } = await import("../bot/sim.mjs"), { decode, newMemory, buildPhase } = await import("../bot/policy.mjs");
const strat = JSON.parse(readFileSync(new URL("../bot/strategies/all-rounder.json", import.meta.url), "utf8"));
const G = loadGame({ seed: 3 }); G.begin(null);
const P = decode(strat.genome, { ban: strat.ban || [] }), M = newMemory(G, P);
while (G.S.level < 45 && G.S.phase !== "over") { buildPhase(G, P, M); G.startWave(); for (let n = 0; G.S.phase === "wave" && n < 12000; n++) G.update(1 / 30); }
const save = g => { const s = JSON.parse(JSON.stringify(g.makeSave())); delete s.savedAt; return s; };
const G2 = loadGame({ seed: 3 }); G2.begin(save(G));
if (JSON.stringify(save(G2)) !== JSON.stringify(save(G))) throw new Error("a saved game doesn't load back the same: compare makeSave() and restore() in endless-keep.html");
console.log(`OK: a game saved at level ${G.S.level} with ${G.S.towers.length} towers loads back the same`);
