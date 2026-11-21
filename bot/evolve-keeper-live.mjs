// Evolves Keepers for live two-player matches: the same genes as a solo strategy (policy.mjs), plus the live habits
// (keeper-live.mjs), trained against the bot Dark Lord (bot/darklords/<dl>.json) at every match length. The
// population starts from the solo strategies. Saved to bot/strategies-live/<name>.json after every generation.
// Take turns with evolve-dl.mjs (--keepers live) so each side trains against the other's best.
//
//   node bot/evolve-keeper-live.mjs --name all-rounder --gens 10
//   node bot/evolve-keeper-live.mjs --name no-dragon --ban dragon --from no-dragon
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool } from "./pool.mjs";
import { GENES, randomGenome, clampGene } from "./policy.mjs";
import { seeded, loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { name: "all-rounder", from: "", dl: "dark-lord", pop: 30, gens: 10, seeds: 3, elite: 3, mutate: .15, ban: "", rng: 1, workers: 0, tune: "", dt: 1 / 30 });
const ban = args.ban ? String(args.ban).split(",").map(s => s.trim()).filter(Boolean) : [];
const tune = Object.fromEntries(String(args.tune || "").split(",").filter(Boolean).map(kv => { const [k, v] = kv.split("="); return [k.trim(), +v]; }));
const rand = seeded(+args.rng);
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
const G0 = loadGame(), lens = G0.vs.TUNE.lens;
const dl = JSON.parse(fs.readFileSync(path.join(HERE, "darklords", `${args.dl}.json`), "utf8"));
const outFile = path.join(HERE, "strategies-live", `${args.name}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const fit = g => GENES.map((_, i) => clampGene(i, g[i] ?? 0));

// start from the live strategy of this name if there is one, then the solo strategies, then random
const pop = [];
if (fs.existsSync(outFile)) pop.push(fit(JSON.parse(fs.readFileSync(outFile, "utf8")).genome));
const soloDir = path.join(HERE, "strategies"), from = args.from || args.name;
const solos = fs.readdirSync(soloDir).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(soloDir, f), "utf8")));
for (const s of solos.sort((a, b) => (b.name === from) - (a.name === from))) if (pop.length < +args.pop / 2 && (!ban.length || ban.every(b => (s.ban || []).includes(b)))) pop.push(fit(s.genome));
while (pop.length < +args.pop) pop.push(randomGenome(rand));

const score = g => g.winner === "keeper" ? 1 + .5 * g.hp / g.maxHp : .9 * g.t / (g.min * 60);
const pool = makePool(+args.workers || undefined);
console.log(`Evolving live Keeper "${args.name}"${ban.length ? ` (never builds ${ban.join(", ")})` : ""} against Dark Lord "${args.dl}": ${pop.length} genomes x ${lens.length} lengths x ${args.seeds} seeds, game ${G0.GAME_VERSION}`);
let best = null;
for (let gen = 0; gen < +args.gens; gen++) {
  const t0 = Date.now(), seeds = Array.from({ length: +args.seeds }, () => 1 + Math.floor(rand() * 1e9));
  const scored = await Promise.all(pop.map(async genome => {
    const games = await Promise.all(lens.flatMap(min => seeds.map(seed => pool.play(dl.genome, { seed, min, tune, dt: +args.dt, match: { keeper: { name: args.name, genome, ban } } }))));
    const byLen = Object.fromEntries(lens.map(m => { const g = games.filter(x => x.min === m); return [m, g.filter(x => x.winner === "keeper").length / g.length]; }));
    return { genome, fitness: games.reduce((a, g) => a + score(g), 0) / games.length, byLen };
  }));
  scored.sort((a, b) => b.fitness - a.fitness);
  const top = scored[0]; best = { ...top, gen };
  console.log(`gen ${String(gen + 1).padStart(3)}  best ${top.fitness.toFixed(3)}  Keeper wins ${lens.map(m => `${m}m ${Math.round(100 * top.byLen[m])}%`).join(" ")}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const pick = () => { let w = null; for (let i = 0; i < 3; i++) { const c = scored[Math.floor(rand() * scored.length)]; if (!w || c.fitness > w.fitness) w = c; } return w.genome; };
  const next = scored.slice(0, +args.elite).map(s => s.genome);
  while (next.length < pop.length) {
    const a = pick(), b = pick(), child = a.map((v, i) => (rand() < .5 ? v : b[i]));
    for (let i = 0; i < child.length; i++) if (rand() < +args.mutate) { const [, lo, hi] = GENES[i]; child[i] = rand() < .1 ? lo + rand() * (hi - lo) : clampGene(i, child[i] + gauss() * .15 * (hi - lo)); }
    next.push(child);
  }
  pop.splice(0, pop.length, ...next);
  fs.writeFileSync(outFile, JSON.stringify({ name: args.name, ban, live: true, against: args.dl, fitness: best.fitness, winsByLength: best.byLen, foundInGeneration: best.gen + 1,
    game: G0.GAME_VERSION, rules: G0.RULES_VERSION, tune, savedAt: new Date().toISOString(), genes: Object.fromEntries(GENES.map(([n], i) => [n, +best.genome[i].toFixed(3)])), genome: best.genome }, null, 1));
}
pool.close();
