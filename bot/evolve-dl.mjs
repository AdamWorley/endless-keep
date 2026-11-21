// Evolves a bot Dark Lord for live two-player matches. Every genome in a generation plays the same matches: every
// evolved Keeper (bot/strategies/*.json) at every match length, on --seeds fresh seeds. Fitness rewards bringing the
// castle down, and sooner; a loss still scores for the hearts it took. The best is saved to bot/darklords/<name>.json
// after every generation, the population to bot/runs/dl-<name>.json for --resume.
//
//   node bot/evolve-dl.mjs --name dark-lord --gens 20
//   node bot/evolve-dl.mjs --name dark-lord --gens 10 --tune gateCost=1   # evolve against changed VS_TUNE numbers
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { makePool } from "./pool.mjs";
import { DL_GENES, randomDL, clampDL, decodeDL } from "./darklord.mjs";
import { seeded, loadGame } from "./sim.mjs";
import { parseArgs } from "./args.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2), { name: "dark-lord", pop: 30, gens: 20, seeds: 2, elite: 3, mutate: .15, resume: false, rng: 1, workers: 0, tune: "", dt: 1 / 30, keepers: "live" });
const tune = Object.fromEntries(String(args.tune || "").split(",").filter(Boolean).map(kv => { const [k, v] = kv.split("="); return [k.trim(), +v]; }));
const rand = seeded(+args.rng);
const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-12)) * Math.cos(2 * Math.PI * rand());
const G0 = loadGame(), lens = G0.vs.TUNE.lens;
const kdir = path.join(HERE, args.keepers === "solo" || !fs.existsSync(path.join(HERE, "strategies-live")) ? "strategies" : "strategies-live");
const keepers = fs.readdirSync(kdir).filter(f => f.endsWith(".json")).map(f => JSON.parse(fs.readFileSync(path.join(kdir, f), "utf8"))).map(k => ({ name: k.name, genome: k.genome, ban: k.ban }));
const outFile = path.join(HERE, "darklords", `${args.name}.json`), runFile = path.join(HERE, "runs", `dl-${args.name}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.mkdirSync(path.dirname(runFile), { recursive: true });

let pop, gen0 = 0, best = null;
if (args.resume && fs.existsSync(runFile)) {
  const r = JSON.parse(fs.readFileSync(runFile, "utf8")); pop = r.pop; gen0 = r.gen; best = r.best;
  console.log(`Resuming ${args.name} from generation ${gen0}`);
} else {
  pop = Array.from({ length: +args.pop }, () => randomDL(rand));
  pop[1] = DL_GENES.map(([, lo, hi]) => (lo + hi) / 2);   // and one plain middle-of-the-road Dark Lord
  if (fs.existsSync(outFile)) { pop[0] = DL_GENES.map((_, i) => clampDL(i, JSON.parse(fs.readFileSync(outFile, "utf8")).genome[i] ?? 0)); console.log(`Seeded the population with the saved ${args.name}`); }
}

const score = g => g.winner === "dark" ? 1 + .5 * (1 - g.t / (g.min * 60)) : .9 * (1 - g.minHp / g.maxHp);
const pool = makePool(+args.workers || undefined);
console.log(`Evolving Dark Lord "${args.name}": ${pop.length} genomes x ${keepers.length} ${path.basename(kdir)} Keepers x ${lens.length} lengths x ${args.seeds} seeds, ${pool.size} workers, game ${G0.GAME_VERSION}${Object.keys(tune).length ? `, tune ${args.tune}` : ""}`);

for (let gen = gen0; gen < gen0 + +args.gens; gen++) {
  const t0 = Date.now();
  const seeds = Array.from({ length: +args.seeds }, () => 1 + Math.floor(rand() * 1e9));
  const scored = await Promise.all(pop.map(async genome => {
    const games = await Promise.all(keepers.flatMap(keeper => lens.flatMap(min => seeds.map(seed => pool.play(genome, { seed, min, tune, dt: +args.dt, match: { keeper } })))));
    const byLen = Object.fromEntries(lens.map(m => { const g = games.filter(x => x.min === m); return [m, g.filter(x => x.winner === "dark").length / g.length]; }));
    return { genome, fitness: games.reduce((a, g) => a + score(g), 0) / games.length, byLen };
  }));
  scored.sort((a, b) => b.fitness - a.fitness);
  const top = scored[0], mean = scored.reduce((a, s) => a + s.fitness, 0) / scored.length;
  best = { genome: top.genome, fitness: top.fitness, byLen: top.byLen, gen };
  console.log(`gen ${String(gen + 1).padStart(3)}  best ${top.fitness.toFixed(3)}  wins ${lens.map(m => `${m}m ${Math.round(100 * top.byLen[m])}%`).join(" ")}  mean ${mean.toFixed(3)}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  const pick = () => { let w = null; for (let i = 0; i < 3; i++) { const c = scored[Math.floor(rand() * scored.length)]; if (!w || c.fitness > w.fitness) w = c; } return w.genome; };
  const next = scored.slice(0, +args.elite).map(s => s.genome);
  while (next.length < pop.length) {
    const a = pick(), b = pick(), child = a.map((v, i) => (rand() < .5 ? v : b[i]));
    for (let i = 0; i < child.length; i++) if (rand() < +args.mutate) { const [, lo, hi] = DL_GENES[i]; child[i] = rand() < .1 ? lo + rand() * (hi - lo) : clampDL(i, child[i] + gauss() * .15 * (hi - lo)); }
    next.push(child);
  }
  pop = next;
  save(gen + 1);
}
pool.close();

function save(gen) {
  const P = decodeDL(best.genome), pct = x => Math.round(x * 100) + "%";
  const summary = {
    sends: P.w.map((w, s) => { const tot = Object.values(w).reduce((a, b) => a + b, 0); return { stage: ["spring-summer", "autumn-winter", "night"][s], ...Object.fromEntries(Object.entries(w).map(([k, v]) => [k, pct(v / tot)])) }; }),
    surge: P.surge.map(x => x < .25 ? "sends at once" : `saves ${x.toFixed(1)} levels' armies`), keepsForSpells: `${pct(P.reserve)} of a level's army`,
    gates: P.gates, firstGate: `${pct(P.gateFrom)} into the match`, sendsFromGates: pct(P.gateUse), keepsBossForSurge: P.bossHold,
  };
  fs.writeFileSync(outFile, JSON.stringify({ name: args.name, fitness: best.fitness, winsByLength: best.byLen, foundInGeneration: best.gen + 1, generations: gen,
    game: G0.GAME_VERSION, rules: G0.RULES_VERSION, tune, savedAt: new Date().toISOString(), summary,
    genes: Object.fromEntries(DL_GENES.map(([n], i) => [n, +best.genome[i].toFixed(3)])), genome: best.genome }, null, 1));
  fs.writeFileSync(runFile, JSON.stringify({ gen, pop, best, args }));
}
