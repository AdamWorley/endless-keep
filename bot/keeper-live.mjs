// What a bot Keeper does differently in a live two-player match, on top of its evolved solo strategy. These are
// habits any player picks up against a human Dark Lord, not evolved genes:
//
// - it watches where monsters join the road: each Dark Gate is a second road start, so towers are valued for the
//   road the monsters actually walk;
// - it watches what's coming: when fliers or armour pour in, towers that hit the sky or pierce armour are worth more;
// - it marks the Dark Gate its towers reach best, so they knock it down.
import { mapInfo, buildPhase } from "./policy.mjs";

// strength: how hard the Keeper leans towards the threats it sees (0 = not at all, as a solo bot would)
export function newLiveKeeper(G, P, M, { strength = 3, focus = true } = {}) { return { P, M, strength, focus, gateKey: "", fly: 0, armour: 0 }; }

export function liveBuild(G, K) {
  const S = G.S, V = S.vs, M = K.M;
  // the road from each gate on counts too
  const key = V.gates.map(g => g.spot).join(",");
  if (key !== K.gateKey) { K.gateKey = key; M.map = mapInfo(G, K.P, [{ d: 0, w: 1 }, ...V.gates.map(g => ({ d: g.e.d, w: 1 }))]); }
  // what's on the road now, blended with what came before
  const road = S.enemies.filter(e => !e.dead && !e.gate);
  if (road.length) {
    const fly = road.filter(e => e.fly).length / road.length, arm = road.filter(e => e.armor >= .15).length / road.length;
    K.fly = .6 * K.fly + .4 * fly; K.armour = .6 * K.armour + .4 * arm;
  }
  const P = { ...K.P, era: K.P.era.map(E => ({ ...E, w: Object.fromEntries(Object.entries(E.w).map(([t, w]) => {
    const T = G.TOWERS[t];
    return [t, w * (T.air ? 1 + K.strength * K.fly : 1) * (T.magic && t !== "frost" ? 1 + K.strength * K.armour : 1)];
  })) })) };
  buildPhase(G, P, M);
  // aim at the gate the towers reach best
  if (K.focus && V.gates.length) {
    const reach = g => S.towers.reduce((a, t) => a + (t.type !== "frost" && t.type !== "lantern" && Math.hypot(t.x - g.e.x, t.y - g.e.y) <= G.vs.tStats(t).range ? 1 : 0), 0);
    const best = V.gates.map(g => ({ g, n: reach(g) })).sort((a, b) => b.n - a.n)[0];
    G.vs.focus(best.n ? best.g.spot : null);
  }
}
