// Fairness test for live two-player matches: a bot Dark Lord (bot/darklords/<name>.json) against every evolved
// Keeper strategy (bot/strategies/*.json), at every match length, on fixed seeds. The target is a Dark Lord that wins
// 40-60% of matches at every length.
//
//   node bot/versus.mjs                          # the "dark-lord" bot, 6 seeds
//   node bot/versus.mjs --dl dark-lord --seeds 10 --save v1
//   node bot/versus.mjs --tune gateCost=1,drip=.9  # try changed VS_TUNE numbers without editing the game
//   node bot/versus.mjs --build-every 30            # the bot Keeper builds every 30 s of the match (default 5)
//   node bot/versus.mjs --solo                      # the Keepers without their live-match habits
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool } from "./pool.mjs";
import { loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { dl: "dark-lord", seeds: 6, tune: "", save: "", workers: 0, dt: 1 / 30, buildEvery: 5, solo: false, keepers: "live" });
export const parseTune = t => Object.fromEntries(String(t || "").split(",").filter(Boolean).map(kv => { const [k, v] = kv.split("="); return [k.trim(), +v]; }));
const tune = parseTune(args.tune);
const dl = JSON.parse(fs.readFileSync(path.join(HERE, "darklords", `${args.dl}.json`), "utf8"));
// the Keepers: "live" (bot/strategies-live, falling back to the solo ones if there are none yet) or "solo" (bot/strategies)
const kdir = path.join(HERE, args.keepers === "solo" || !fs.existsSync(path.join(HERE, "strategies-live")) ? "strategies" : "strategies-live");
const keepers = fs.readdirSync(kdir).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(kdir, f), "utf8")));
const G0 = loadGame(), lens = G0.vs.TUNE.lens, seeds = Array.from({ length: +args.seeds }, (_, i) => 3_000_000_000 + i);

const pool = makePool(+args.workers || undefined);
console.log(`Game ${G0.GAME_VERSION}: Dark Lord "${dl.name}" vs ${keepers.length} ${path.basename(kdir)} Keepers x ${lens.length} lengths x ${seeds.length} seeds${Object.keys(tune).length ? `, tune ${args.tune}` : ""}\n`);
const games = await Promise.all(keepers.flatMap(k => lens.flatMap(min => seeds.map(seed => pool.play(dl.genome, { seed, min, tune, dt: +args.dt, buildEvery: +args.buildEvery, live: !args.solo, match: { keeper: { name: k.name, genome: k.genome, ban: k.ban } } })))));
pool.close();

const pct = (a, n) => n ? Math.round(100 * a / n) + "%" : "-";
const pad = (v, n) => String(v).padStart(n);
console.log(`${"keeper".padEnd(14)}${lens.map(m => pad(m + " min", 9)).join("")}`);
for (const k of keepers) console.log(`${k.name.padEnd(14)}${lens.map(m => { const g = games.filter(x => x.keeper === k.name && x.min === m); return pad(pct(g.filter(x => x.winner === "dark").length, g.length), 9); }).join("")}`);
const rows = lens.map(m => { const g = games.filter(x => x.min === m), d = g.filter(x => x.winner === "dark"); return { min: m, games: g.length, dark: d.length,
  fellAt: d.length ? Math.round(d.reduce((a, x) => a + x.t, 0) / d.length) : null, keeperHp: Math.round(100 * g.filter(x => x.winner === "keeper").reduce((a, x) => a + x.hp / x.maxHp, 0) / Math.max(1, g.length - d.length)) }; });
console.log(`${"Dark Lord wins".padEnd(14)}${rows.map(r => pad(pct(r.dark, r.games), 9)).join("")}`);
console.log(`\nWhen the Dark Lord wins, the castle falls at (average): ${rows.map(r => `${r.min} min: ${r.fellAt == null ? "-" : `${Math.floor(r.fellAt / 60)}:${String(r.fellAt % 60).padStart(2, "0")}`}`).join(", ")}`);
console.log(`When the Keeper wins, hearts left (average): ${rows.map(r => `${r.min} min: ${r.keeperHp}%`).join(", ")}`);
const fair = rows.every(r => r.dark / r.games >= .4 && r.dark / r.games <= .6);
console.log(fair ? "\nFair: the Dark Lord wins 40-60% at every length." : "\nNot fair yet: the target is 40-60% at every length.");
if (args.save) { fs.mkdirSync(path.join(HERE, "results"), { recursive: true }); fs.writeFileSync(path.join(HERE, "results", `versus-${args.save}.json`), JSON.stringify({ game: G0.GAME_VERSION, dl: args.dl, tune, at: new Date().toISOString(), rows, games }, null, 1)); console.log(`Saved as bot/results/versus-${args.save}.json`); }
