// Balance test: plays every saved strategy (bot/strategies/*.json) on the same fixed seeds against the current
// game and reports how far each gets. Save a run, change the game, run again with --compare to see the effect.
//
//   node bot/test.mjs                         # every strategy, 20 games each
//   node bot/test.mjs --games 50 --save before
//   node bot/test.mjs --compare before        # after a balance change
//   node bot/test.mjs --only all-rounder,no-dragons
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool } from "./pool.mjs";
import { loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { games: 20, maxLevel: 150, dt: 1 / 30, only: "", save: "", compare: "", workers: 0, map: "" });
const dir = path.join(HERE, "strategies"), resDir = path.join(HERE, "results");
const only = args.only ? String(args.only).split(",") : null;
const strategies = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter(s => !only || only.includes(s.name)) : [];
if (!strategies.length) { console.log("No strategies yet. Make one with: node bot/evolve.mjs --name all-rounder"); process.exit(1); }

const G0 = loadGame();
// test seeds are fixed (and differ from anything evolution trains on, which draws seeds from 1 to a billion at random)
const seeds = Array.from({ length: +args.games }, (_, i) => 2_000_000_000 + i);
const SEASONS = ["Spring", "Summer", "Autumn", "Winter", "Night"];
const seasonOf = L => SEASONS[Math.floor((Math.max(1, L) - 1) / 10) % 5];

const pool = makePool(+args.workers || undefined);
console.log(`Game ${G0.GAME_VERSION}, rules v${G0.RULES_VERSION}: ${strategies.length} strateg${strategies.length === 1 ? "y" : "ies"} x ${seeds.length} games, levels capped at ${args.maxLevel}\n`);
const report = { game: G0.GAME_VERSION, rules: G0.RULES_VERSION, at: new Date().toISOString(), games: seeds.length, maxLevel: +args.maxLevel, strategies: {} };
await Promise.all(strategies.map(async s => {
  const games = await Promise.all(seeds.map(seed => pool.play(s.genome, { seed, maxLevel: +args.maxLevel, dt: +args.dt, ban: s.ban || [], map: args.map || "" })));
  const held = games.map(g => g.held).sort((a, b) => a - b);
  const fellIn = {}, through = {};
  for (const g of games) {
    if (g.won) continue;
    const fell = g.held + 1, k = (fell % 10 === 0 ? "boss level" : seasonOf(fell));
    fellIn[k] = (fellIn[k] || 0) + 1;
    for (const e of g.killedBy || []) through[e] = (through[e] || 0) + 1;
  }
  report.strategies[s.name] = {
    mean: +(held.reduce((a, b) => a + b, 0) / held.length).toFixed(1), median: held[held.length >> 1], min: held[0], max: held[held.length - 1],
    reachedCap: games.filter(g => g.won).length, fellIn, through, held,
  };
}));
pool.close();

const prev = args.compare ? JSON.parse(fs.readFileSync(path.join(resDir, `${args.compare}.json`), "utf8")) : null;
const rows = Object.entries(report.strategies).sort((a, b) => b[1].mean - a[1].mean);
const pad = (v, n) => String(v).padStart(n);
console.log(`${"strategy".padEnd(22)}${pad("mean", 7)}${pad("median", 8)}${pad("min", 6)}${pad("max", 6)}${prev ? pad("vs " + args.compare, 14) : ""}   falls in`);
for (const [name, r] of rows) {
  const p = prev && prev.strategies[name];
  const delta = p ? `${r.mean - p.mean >= 0 ? "+" : ""}${(r.mean - p.mean).toFixed(1)} (${p.mean})` : prev ? "new" : "";
  const falls = Object.entries(r.fellIn).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ") + (r.reachedCap ? `${Object.keys(r.fellIn).length ? ", " : ""}held to the cap ${r.reachedCap}` : "");
  console.log(`${name.padEnd(22)}${pad(r.mean, 7)}${pad(r.median, 8)}${pad(r.min, 6)}${pad(r.max, 6)}${prev ? pad(delta, 14) : ""}   ${falls}`);
}
const through = {};
for (const [, r] of rows) for (const [k, n] of Object.entries(r.through)) through[k] = (through[k] || 0) + n;
console.log(`\nStill on the road when the keep fell (all strategies): ${Object.entries(through).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(", ") || "nothing"}`);
if (args.save) { fs.mkdirSync(resDir, { recursive: true }); fs.writeFileSync(path.join(resDir, `${args.save}.json`), JSON.stringify(report, null, 1)); console.log(`Saved as bot/results/${args.save}.json`); }
