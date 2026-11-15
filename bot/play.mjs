// Plays one whole game with one strategy and reports what happened.
import { loadGame } from "./sim.mjs";
import { decode, newMemory, buildPhase, TYPES } from "./policy.mjs";

// dt: seconds per simulation step. The real game steps at about 1/60 s (three times per frame at 3x speed);
// 1/30 is close enough and twice as fast to run
export function playGame(genome, { seed = 1, maxLevel = 150, dt = 1 / 30, ban = [], perks = {}, dynasty = 0, trace = false } = {}) {
  const G = loadGame({ seed, perks, dynasty });
  G.begin(null);
  const S = G.S, P = decode(genome, { ban }), M = newMemory(G, P);
  const levels = [];
  let steps = 0;
  while (S.phase !== "over" && S.level <= maxLevel) {
    G.checkSeason();
    buildPhase(G, P, M);
    const L = S.level, hp0 = S.hp;
    G.checkSeason();
    G.startWave();
    const cap = steps + 400 / dt;   // no level should last 400 seconds
    while (S.phase === "wave" && steps < cap) { G.update(dt); steps++; }
    if (S.phase === "wave") break;  // stuck: count it as the end
    if (trace) levels.push({ L, hpLost: hp0 - S.hp, gold: S.gold, towers: S.towers.length, ev: G.curEv()?.id || null });
  }
  const held = Math.min(maxLevel, S.phase === "over" ? S.level - 1 : S.level - 1);
  const byType = Object.fromEntries(TYPES.map(t => [t, S.towers.filter(x => x.type === t).length]));
  const lvlByType = Object.fromEntries(TYPES.map(t => [t, S.towers.filter(x => x.type === t).reduce((a, x) => a + x.lvl, 0)]));
  return {
    seed, held, won: S.phase !== "over", steps, gold: Math.round(S.gold), hp: S.hp, maxHp: S.maxHp,
    towers: byType, towerLevels: lvlByType, fort: { ...S.fort }, walls: S.walls, treasury: S.treasury,
    killedBy: S.phase === "over" ? lastLeaker(S) : null, kills: S.stats.kills, levels: trace ? levels : undefined,
  };
}

// the monsters still on the road when the keep fell: what got through
function lastLeaker(S) {
  const near = S.enemies.filter(e => !e.dead).sort((a, b) => b.d / b.path.len - a.d / a.path.len).slice(0, 3);
  return near.map(e => e.k);
}
