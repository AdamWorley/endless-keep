// Records one bot game for the replay viewer. Open the game with #replay on the end of its address (the built game
// at http://localhost:8420/#replay, or dist/index.html#replay straight from disk) and drop the file in.
//
//   npm run bot:replay                                   # all-rounder, first test seed, the last 10 levels
//   npm run bot:replay -- --strategy no-frost --seed 7 --levels 40-60
//   npm run bot:replay -- --levels all                   # every level (big: tens of MB)
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { playGame } from "./play.mjs";
import { loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { strategy: "all-rounder", seed: 2_000_000_000, levels: "last10", every: 3, maxLevel: 150, dt: 1 / 30, out: "" });
const strat = JSON.parse(fs.readFileSync(path.join(HERE, "strategies", `${args.strategy}.json`), "utf8"));

// --levels: "last10", "40-60", "55" or "all"
const lv = String(args.levels), record = { every: Math.max(1, +args.every) };
if (/^last\d+$/.test(lv)) record.last = +lv.slice(4);
else if (/^\d+-\d+$/.test(lv)) [record.from, record.to] = lv.split("-").map(Number);
else if (/^\d+$/.test(lv)) record.from = record.to = +lv;
else if (lv !== "all") { console.error(`--levels should be like last10, 40-60, 55 or all (not "${lv}")`); process.exit(1); }

const G0 = loadGame(), t0 = Date.now();
const r = playGame(strat.genome, { seed: +args.seed, maxLevel: +args.maxLevel, dt: +args.dt, ban: strat.ban || [], record });
const meta = {
  strategy: args.strategy, seed: +args.seed, held: r.held, killedBy: r.killedBy, game: G0.GAME_VERSION, rules: G0.RULES_VERSION,
  recordedAt: new Date().toISOString(), map: r.map, levels: r.levels,
};
const out = args.out || path.join(HERE, "replays", `${args.strategy}-${args.seed}-${lv}.json.gz`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const gz = zlib.gzipSync(JSON.stringify({ meta, frames: r.frames }));
fs.writeFileSync(out, gz);
const lvls = [...new Set(r.frames.map(f => f.L))];
console.log(`${args.strategy} on seed ${args.seed} held ${r.held} levels${r.killedBy ? ` (fell to ${r.killedBy.join(", ")})` : ""}, in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
console.log(`Recorded ${lvls.length ? `levels ${lvls[0]}-${lvls[lvls.length - 1]}` : "nothing"}: ${r.frames.length} frames, ${(gz.length / 1048576).toFixed(1)} MB`);
console.log(`Saved ${path.relative(process.cwd(), out)}. Open the game with #replay on the end of its address and drop the file in.`);
