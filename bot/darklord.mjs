// The bot Dark Lord: a list of numbers (genes) turned into the moves a Dark Lord makes in a live two-player match.
// It sends exactly the messages a human Dark Lord's phone would (G.vs.send), so it plays by the same rules: what it
// may send, when, from where, and what it costs are all decided by the game.
//
// Every half second of the match it may: raise a Dark Gate where the Keeper's towers reach least, cast a spell when
// enough monsters are on the road, play a boss, and send packs of monsters. It either sends as soon as it can
// afford to, or saves up and sends everything in one surge. Which monsters it sends depends on the stage of the
// match (the seasons) and on what the Keeper has built: fliers when few towers can shoot at the sky, armoured
// monsters when there is little magic.

export const STAGES = [2, 4, 5];   // stage 0: spring and summer, stage 1: autumn and winter, stage 2: night
const stageOf = season => STAGES.findIndex(s => season < s);
export const KINDS = ["goblin", "wolf", "orc", "bat", "wolfrider", "knight", "troll", "wyvern", "orcrider", "slime"];
const ARMOURED = { orc: .15, knight: .5, troll: .1, wyvern: .1, orcrider: .15 };

export const DL_GENES = [];
for (let s = 0; s < STAGES.length; s++) for (const k of KINDS) DL_GENES.push([`s${s}.w.${k}`, -4, 4]);
DL_GENES.push(
  ["s0.surge", 0, 3], ["s1.surge", 0, 3], ["s2.surge", 0, 3],   // dread to save before a surge, in levels' armies (under .25: send as soon as possible)
  ["reserve", 0, .6],          // share of a level's army kept back for spells
  ["gates", 0, 3.49],          // gates to keep standing (rounded)
  ["gateFrom", 0, 1],          // how far into the match before raising the first gate
  ["gateUse", 0, 1],           // share of packs sent from a gate rather than the road's start
  ["vsAir", -3, 3],            // + sends more fliers when few towers can hit them
  ["vsArmour", -3, 3],         // + sends more armour when the Keeper has little magic
  ["swiftAt", 0, 30], ["armorAt", 0, 30], ["fogAt", 0, 30],    // cast when at least this many monsters are on the road
  ["healAt", .1, .9],          // cast Dark mending when monsters on the road have lost this share of their health
  ["bossHold", 0, 1],          // over .5: keep a boss for the next surge instead of sending it at once
);
export const DL_INDEX = Object.fromEntries(DL_GENES.map((g, i) => [g[0], i]));
export const randomDL = rand => DL_GENES.map(([, lo, hi]) => lo + rand() * (hi - lo));
export const clampDL = (i, v) => Math.min(DL_GENES[i][2], Math.max(DL_GENES[i][1], v));

export function decodeDL(g) {
  const v = n => g[DL_INDEX[n]];
  return {
    w: STAGES.map((_, s) => Object.fromEntries(KINDS.map(k => [k, Math.exp(v(`s${s}.w.${k}`))]))),
    surge: STAGES.map((_, s) => v(`s${s}.surge`)), reserve: v("reserve"), gates: Math.round(v("gates")), gateFrom: v("gateFrom"), gateUse: v("gateUse"),
    vsAir: v("vsAir"), vsArmour: v("vsArmour"), at: { swift: v("swiftAt"), armor: v("armorAt"), fog: v("fogAt") }, healAt: v("healAt"), bossHold: v("bossHold") > .5,
  };
}

// a small seeded random of its own, so the bot's choices don't disturb the game's
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function newDL(G, P, seed = 1) { return { P, rand: rng(seed ^ 0x5eed), next: 0, surging: false, sent: 0, gates: 0, spells: 0, bosses: 0 }; }

// one look at the board, every half second of the match
export function dlStep(G, D) {
  const S = G.S, V = S.vs, VS = G.vs, P = D.P;
  if (!V || S.phase !== "wave" || V.t < D.next) return;
  D.next = V.t + .5;
  const army = VS.budget(S.level), stage = stageOf(V.season), send = m => VS.send(m);
  const reserve = P.reserve * army;

  // gates: where the fewest towers reach
  if (V.gates.length < Math.min(P.gates, VS.TUNE.gateMax) && V.t >= P.gateFrom * V.len && V.dread >= VS.gateCost() + reserve) {
    const free = V.spots.map((sp, i) => ({ i, sp })).filter(o => !V.gates.some(g => g.spot === o.i))
      .map(o => ({ ...o, cover: S.towers.reduce((a, t) => a + (t.type === "lantern" || t.type === "frost" ? 0 : Math.hypot(t.x - o.sp.x, t.y - o.sp.y) <= VS.tStats(t).range ? 1 : 0), 0) }))
      .sort((a, b) => a.cover - b.cover);
    for (const o of free) if (send({ t: "gate", spot: o.i })) { D.gates++; break; }
  }

  // spells
  const road = S.enemies.filter(e => !e.dead && !e.gate);
  for (const id of ["swift", "armor", "fog"]) if (road.length >= P.at[id] && V.dread >= VS.spellCost(id) && send({ t: "spell", id })) D.spells++;
  if (road.length >= 5) {
    const max = road.reduce((a, e) => a + e.max, 0), hp = road.reduce((a, e) => a + e.hp, 0);
    if (max && 1 - hp / max >= P.healAt && send({ t: "spell", id: "heal" })) D.spells++;
  }

  // surge or trickle
  const surgeAt = P.surge[stage] * army;
  if (P.surge[stage] >= .25) {
    if (!D.surging && V.dread >= surgeAt + reserve) D.surging = true;
    if (!D.surging) return;
  }
  if (V.boss > 0 && (!P.bossHold || D.surging) && send({ t: "boss", gate: pickGate(G, D) })) D.bosses++;

  // packs: weighted by stage and by what the Keeper lacks
  const sky = S.towers.filter(t => G.TOWERS[t.type].air).length / Math.max(1, S.towers.length);
  const magic = S.towers.filter(t => t.type === "mage" || t.type === "dragon").length / Math.max(1, S.towers.length);
  for (let tries = 0; tries < 6; tries++) {
    const opts = VS.avail().filter(k => KINDS.includes(k) && !(V.cd[k] > 0)).map(k => {
      const p = VS.pack(k), fly = G.ENEMIES[k].fly ? 1 : 0, arm = ARMOURED[k] || 0;
      const w = P.w[stage][k] * Math.exp(P.vsAir * fly * (1 - sky) + P.vsArmour * arm * 2 * (1 - magic));
      return { k, p, w };
    }).filter(o => o.p.cost <= V.dread - (D.surging ? 0 : reserve));
    if (!opts.length) break;
    const tot = opts.reduce((a, o) => a + o.w, 0); let r = D.rand() * tot, pick = opts[0];
    for (const o of opts) { r -= o.w; if (r <= 0) { pick = o; break; } }
    if (!send({ t: "summon", k: pick.k, gate: pickGate(G, D) })) break;
    D.sent += pick.p.cost;
  }
  if (D.surging && V.dread < Math.min(...VS.avail().map(k => VS.pack(k).cost))) D.surging = false;
}

function pickGate(G, D) {
  const V = G.S.vs;
  if (!V.gates.length || D.rand() >= D.P.gateUse) return null;
  return Math.floor(D.rand() * V.gates.length);
}
