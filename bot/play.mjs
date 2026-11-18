// Plays one whole game with one strategy and reports what happened.
import { loadGame } from "./sim.mjs";
import { decode, newMemory, buildPhase, TYPES } from "./policy.mjs";

// dt: seconds per simulation step. The real game steps at about 1/60 s (three times per frame at 3x speed);
// 1/30 is close enough and twice as fast to run
// record: keep snapshots of the game for a replay ({ from, to } levels, or { last: n } for the last n levels played;
// every: one snapshot per this many steps). The frames come back as result.frames
export function playGame(genome, { seed = 1, maxLevel = 150, dt = 1 / 30, ban = [], perks = {}, dynasty = 0, trace = false, record = null } = {}) {
  const G = loadGame({ seed, perks, dynasty });
  G.begin(null);
  const S = G.S, P = decode(genome, { ban }), M = newMemory(G, P);
  const levels = [], rec = record ? recorder(G, record) : null;
  let steps = 0;
  while (S.phase !== "over" && S.level <= maxLevel) {
    G.checkSeason();
    buildPhase(G, P, M);
    const L = S.level, hit0 = S.hitTotal || 0;   // hearts lost to monsters this level (not counting repairs)
    if (rec) rec.level(L);
    G.checkSeason();
    G.startWave();
    const cap = steps + 400 / dt;   // no level should last 400 seconds
    while (S.phase === "wave" && steps < cap) { G.update(dt); steps++; if (rec) rec.step(dt); }
    if (S.phase === "wave") break;  // stuck: count it as the end
    if (trace || rec) levels.push({ L, hpLost: (S.hitTotal || 0) - hit0, gold: S.gold, towers: S.towers.length, ev: G.curEv()?.id || null });
  }
  const held = Math.min(maxLevel, S.phase === "over" ? S.level - 1 : S.level - 1);
  const byType = Object.fromEntries(TYPES.map(t => [t, S.towers.filter(x => x.type === t).length]));
  const lvlByType = Object.fromEntries(TYPES.map(t => [t, S.towers.filter(x => x.type === t).reduce((a, x) => a + x.lvl, 0)]));
  return {
    seed, held, won: S.phase !== "over", steps, gold: Math.round(S.gold), hp: S.hp, maxHp: S.maxHp,
    towers: byType, towerLevels: lvlByType, fort: { ...S.fort }, walls: S.walls, treasury: S.treasury,
    killedBy: S.phase === "over" ? lastLeaker(S) : null, kills: S.stats.kills, levels: trace || rec ? levels : undefined,
    frames: rec ? rec.done() : undefined, map: rec && G.MAP !== G.DEFAULT_MAP ? G.MAP.road : null,
  };
}

// snapshots for a replay. Towers and trees are stored only when they change (and at the start of every level, so
// any level can be played on its own); in between, a frame carries just the towers' aim and muzzle flash
function recorder(G, { from = 1, to = Infinity, last = 0, every = 3 }) {
  const byLevel = [];
  let g = 0, n = 0, cur = null, curL = 0, twKey = "", trKey = "";
  const snap = (first) => {
    const f = G.snapState();
    const tk = JSON.stringify(f.tw.map(a => [a[0], a[1], a[2], a[3], a[6], a[7]])), rk = JSON.stringify(f.tr);
    if (first || tk !== twKey) twKey = tk; else { f.ta = f.tw.flatMap(a => [a[4], a[5]]); delete f.tw; }
    if (first || rk !== trKey) trKey = rk; else delete f.tr;
    f.g = Math.round(g * 100) / 100;
    cur.push(f);
  };
  return {
    level(L) {
      cur = null; curL = L;
      if (L < from || L > to) return;
      cur = []; byLevel.push(cur);
      if (last && byLevel.length > last) byLevel.shift();
      g += 1.5;           // a moment on the built board before the wave
      snap(true); n = 0;
    },
    // (the step that clears a level has already moved on to the next one: that belongs to the next level's frames)
    step(dt) { g += dt; if (cur && ++n % every === 0 && G.S.level === curL) snap(false); },
    done() {
      // times run on from the first frame kept
      const frames = byLevel.flat(), g0 = frames.length ? frames[0].g : 0;
      for (const f of frames) f.g = Math.round((f.g - g0) * 100) / 100;
      return frames;
    },
  };
}

// the monsters still on the road when the keep fell: what got through
function lastLeaker(S) {
  const near = S.enemies.filter(e => !e.dead).sort((a, b) => b.d / b.path.len - a.d / a.path.len).slice(0, 3);
  return near.map(e => e.k);
}
