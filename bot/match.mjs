// Plays one live two-player match: a bot Keeper (an evolved solo strategy plus live-match habits, keeper-live.mjs,
// building every buildEvery seconds) against a bot Dark Lord. tune: changes to the game's VS_TUNE for this match, for trying out balance.
import { loadGame } from "./sim.mjs";
import { decode, newMemory } from "./policy.mjs";
import { decodeDL, newDL, dlStep } from "./darklord.mjs";
import { newLiveKeeper, liveBuild } from "./keeper-live.mjs";

export function playMatch(dlGenome, keeper, { seed = 1, min = 15, dt = 1 / 30, tune = {}, buildEvery = 5, live = true } = {}) {
  const G = loadGame({ seed });
  if (!G.vs) throw new Error("this copy of the game has no live two-player match");
  Object.assign(G.vs.TUNE, tune);
  G.vs.begin(min);
  const S = G.S, V = S.vs;
  const P = decode(keeper.genome, { ban: keeper.ban || [] }), M = newMemory(G, P), D = newDL(G, decodeDL(dlGenome), seed);
  const K = newLiveKeeper(G, P, M, live ? {} : { strength: 0, focus: false });   // live: false plays the solo strategy as it is
  let next = 0, steps = 0, minHp = S.hp;
  while (S.phase !== "over") {
    if (V.t >= next) { next = V.t + buildEvery; liveBuild(G, K); }   // a human Keeper builds all the time, not just between levels
    dlStep(G, D);
    G.update(dt); steps++;
    minHp = Math.min(minHp, S.hp);
    if (steps > (min * 60 + 30) / dt) break;   // the clock should have ended it
  }
  const dark = S.hp <= 0;
  return {
    seed, min, keeper: keeper.name, winner: dark ? "dark" : "keeper", t: Math.round(V.t), level: S.level,
    hp: Math.max(0, S.hp), maxHp: S.maxHp, minHp: Math.max(0, minHp), hits: S.hitTotal || 0,
    towers: S.towers.length, gold: Math.round(S.gold), dreadLeft: Math.round(V.dread), sent: Math.round(D.sent),
    gates: D.gates, spells: D.spells, bosses: D.bosses,
  };
}
