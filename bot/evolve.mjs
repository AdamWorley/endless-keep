// Evolves strategies: a population of genomes plays the same seeds each generation; the best survive unchanged,
// the rest are bred from tournament winners (uniform crossover) and mutated. The best strategy so far is saved
// to bot/strategies/<name>.json after every generation, and the whole population to bot/runs/<name>.json so
// a run can carry on with --resume.
//
//   node bot/evolve.mjs --name all-rounder --gens 30
//   node bot/evolve.mjs --name no-dragons --ban dragon --gens 30
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool } from "./pool.mjs";
import { GENES, randomGenome, clampGene, decode } from "./policy.mjs";
import { seeded, loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), {
  name: "strategy", pop: 40, gens: 25, seeds: 4, elite: 4, maxLevel: 150, dt: 1 / 30, mutate: .15, ban: "", resume: false, rng: 1, workers: 0,
});
const ban = args.ban ? String(args.ban).split(",").map(s => s.trim()).filter(Boolean) : [];
const rand = seeded(+args.rng);
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
const G0 = loadGame();   // for the versions only
const stratFile = path.join(HERE, "strategies", `${args.name}.json`), runFile = path.join(HERE, "runs", `${args.name}.json`);
fs.mkdirSync(path.dirname(stratFile), { recursive: true }); fs.mkdirSync(path.dirname(runFile), { recursive: true });

let pop, gen0 = 0, best = null;
if (args.resume && fs.existsSync(runFile)) {
  const r = JSON.parse(fs.readFileSync(runFile, "utf8"));
  pop = r.pop; gen0 = r.gen; best = r.best;
  console.log(`Resuming ${args.name} from generation ${gen0}`);
} else {
  pop = Array.from({ length: +args.pop }, () => randomGenome(rand));
  // start from an existing strategy too, if there is one with this name
  // (a strategy saved before a gene was added is short: the missing genes start at 0, the middle of most ranges)
  if (fs.existsSync(stratFile)) { pop[0] = GENES.map((_, i) => clampGene(i, JSON.parse(fs.readFileSync(stratFile, "utf8")).genome[i] ?? 0)); console.log(`Seeded the population with the saved ${args.name}`); }
}

const pool = makePool(+args.workers || undefined);
console.log(`Evolving "${args.name}": ${pop.length} strategies x ${args.seeds} games each, ${pool.size} workers, game ${G0.GAME_VERSION} rules v${G0.RULES_VERSION}${ban.length ? `, never builds ${ban.join(", ")}` : ""}`);

for (let gen = gen0; gen < gen0 + +args.gens; gen++) {
  const t0 = Date.now();
  const seeds = Array.from({ length: +args.seeds }, () => 1 + Math.floor(rand() * 1e9));
  const opts = { maxLevel: +args.maxLevel, dt: +args.dt, ban };
  const scored = await Promise.all(pop.map(async genome => {
    const games = await Promise.all(seeds.map(seed => pool.play(genome, { ...opts, seed })));
    const held = games.map(g => g.held);
    return { genome, fitness: held.reduce((a, b) => a + b, 0) / held.length, held, games };
  }));
  scored.sort((a, b) => b.fitness - a.fitness);
  const top = scored[0], mean = scored.reduce((a, s) => a + s.fitness, 0) / scored.length;
  // last generation's best is always carried over and played on the same seeds, so this generation's top is the best so far
  best = { genome: top.genome, fitness: top.fitness, held: top.held, gen };
  const mix = Object.entries(top.games[0].towers).filter(([, n]) => n).map(([t, n]) => `${n} ${t}`).join(", ");
  console.log(`gen ${String(gen + 1).padStart(3)}  best ${top.fitness.toFixed(1).padStart(5)} (${top.held.join(" ")})  mean ${mean.toFixed(1).padStart(5)}  ${((Date.now() - t0) / 1000).toFixed(0)}s  [${mix}]`);

  // next generation: elites as they are, the rest bred from tournament winners
  const pick = () => { let w = null; for (let i = 0; i < 3; i++) { const c = scored[Math.floor(rand() * scored.length)]; if (!w || c.fitness > w.fitness) w = c; } return w.genome; };
  const next = scored.slice(0, +args.elite).map(s => s.genome);
  while (next.length < pop.length) {
    const a = pick(), b = pick();
    const child = a.map((v, i) => (rand() < .5 ? v : b[i]));
    for (let i = 0; i < child.length; i++) {
      if (rand() < +args.mutate) {
        const [, lo, hi] = GENES[i];
        child[i] = rand() < .1 ? lo + rand() * (hi - lo) : clampGene(i, child[i] + gauss() * .15 * (hi - lo));
      }
    }
    next.push(child);
  }
  pop = next;
  save(gen + 1);
}
pool.close();

function save(gen) {
  const named = Object.fromEntries(GENES.map(([n], i) => [n, +best.genome[i].toFixed(3)]));
  fs.writeFileSync(stratFile, JSON.stringify({
    name: args.name, ban, fitness: best.fitness, held: best.held, foundInGeneration: best.gen + 1, generations: gen,
    game: G0.GAME_VERSION, rules: G0.RULES_VERSION, savedAt: new Date().toISOString(),
    summary: summarise(decode(best.genome, { ban })), genes: named, genome: best.genome,
  }, null, 1));
  fs.writeFileSync(runFile, JSON.stringify({ gen, pop, best, args }));
}

// a readable account of what the strategy does
function summarise(P) {
  const pct = x => Math.round(x * 100) + "%";
  return {
    eras: P.era.map((E, i) => {
      const tot = Object.values(E.w).reduce((a, b) => a + b, 0) + E.upgrade;
      return { levels: ["1-15", "16-40", "41+"][i], spend: `towers ${pct(E.pot.towers)}, castle ${pct(E.pot.castle)}, economy ${pct(E.pot.economy)}`,
        towerWeights: Object.fromEntries(Object.entries(E.w).map(([t, w]) => [t, pct(w / tot)])), upgradeWeight: pct(E.upgrade / tot) };
    }),
    builds: P.roadBias > .5 ? "near the castle" : P.roadBias < -.5 ? "near where monsters come in" : "along the whole road",
    patience: pct(P.patience), repairBelow: pct(P.repairAt), treasuryPayback: `${P.treasuryPayback.toFixed(1)} levels`,
    saplings: P.saplings, harvestAt: ["", "young tree", "old oak", "mighty oak"][P.harvestStage], chopsWildTrees: P.chopAll,
    paysToll: `if under ${pct(P.toll)} of gold`, paysWizard: `if under ${pct(P.wizard)} of gold`,
  };
}
