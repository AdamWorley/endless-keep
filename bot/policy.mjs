// A strategy is a list of numbers (genes). This file says what each gene means and turns a genome into the
// decisions a player makes between levels: what to build and where, what to upgrade, what to buy at the castle,
// whether to pay a toll or a wizard, and what to do with trees.
//
// Income is shared out between three pots by gene-controlled shares that change with the stage of the game
// (era): towers, castle (walls, archers, mages, moat, masons) and economy (treasury, saplings). Each pot is spent on
// its best option, so a strategy can save up for something big. Repairs come first when the castle is low.

export const TYPES = ["archer", "mage", "frost", "catapult", "lantern", "dragon"];
export const ERAS = [15, 40, Infinity];          // era 0: levels 1-15, era 1: 16-40, era 2: 41 and later
const eraOf = L => ERAS.findIndex(e => L <= e);

// every gene: name, lowest and highest value. "w" genes are log weights (the strategy uses e^gene)
export const GENES = [];
for (let e = 0; e < ERAS.length; e++) {
  GENES.push([`e${e}.pot.towers`, -3, 3], [`e${e}.pot.castle`, -3, 3], [`e${e}.pot.economy`, -3, 3]);
  for (const t of TYPES) GENES.push([`e${e}.w.${t}`, -4, 4]);
  GENES.push([`e${e}.w.upgrade`, -4, 4]);
}
GENES.push(
  ["roadBias", -3, 3],          // + builds towards the castle end of the road, - towards where monsters come in
  ["patience", 0, 1],           // 1: always save for the best option; 0: buy whatever is affordable
  ["repairAt", 0, 1],           // repair when hearts fall below this share of the maximum
  ["w.walls", -4, 4], ["w.archers", -4, 4], ["w.moat", -4, 4], ["w.masons", -4, 4],
  ["treasuryPayback", 1, 40],   // open or upgrade the treasury if it pays for itself within this many levels
  ["saplings", 0, 12],          // saplings to keep growing on spare grass
  ["harvestStage", 1, 3],       // chop a planted tree once it reaches this stage (1 young tree ... 3 mighty oak)
  ["chopAll", 0, 1],            // over 0.5: chop every wild tree at the start for firewood
  ["toll", 0, 1],               // pay the goblin toll if it costs no more than this share of your gold
  ["wizard", 0, 1],             // the same for the wandering wizard
  ["lanternDark", 0, 4],        // how much more a Lantern is worth on a dark or foggy level
  ["w.mages", -4, 4],           // castle mages (rules v5); last, so older saved genomes still line up
);
export const GENE_INDEX = Object.fromEntries(GENES.map((g, i) => [g[0], i]));

export function randomGenome(rand) { return GENES.map(([, lo, hi]) => lo + rand() * (hi - lo)); }
export const clampGene = (i, v) => Math.min(GENES[i][2], Math.max(GENES[i][1], v));

// genome (array) -> named parameters. ban: tower types this strategy may never build
export function decode(g, { ban = [] } = {}) {
  const v = n => g[GENE_INDEX[n]];
  const era = [0, 1, 2].map(e => {
    const pots = ["towers", "castle", "economy"].map(p => Math.exp(v(`e${e}.pot.${p}`)));
    const sum = pots.reduce((a, b) => a + b, 0);
    return {
      pot: { towers: pots[0] / sum, castle: pots[1] / sum, economy: pots[2] / sum },
      w: Object.fromEntries(TYPES.map(t => [t, ban.includes(t) ? 0 : Math.exp(v(`e${e}.w.${t}`))])),
      upgrade: Math.exp(v(`e${e}.w.upgrade`)),
    };
  });
  return {
    era, roadBias: v("roadBias"), patience: v("patience"), repairAt: v("repairAt"),
    castle: { walls: Math.exp(v("w.walls")), archers: Math.exp(v("w.archers")), moat: Math.exp(v("w.moat")), masons: Math.exp(v("w.masons")), mages: Math.exp(v("w.mages") ?? 0) },
    treasuryPayback: v("treasuryPayback"), saplings: Math.round(v("saplings")), harvestStage: Math.round(v("harvestStage")),
    chopAll: v("chopAll") > .5, toll: v("toll"), wizard: v("wizard"), lanternDark: v("lanternDark"), ban,
  };
}

/* ---------- the map, worked out once per game ---------- */
// every grid cell, with how much of the road each tower type would cover from there (weighted along the road)
// entries: where monsters join the road (two players: the road's start and each Dark Gate), and how much of the
// traffic each brings; a stretch of road counts for the traffic that passes it. Solo games have one entry at the start
export function mapInfo(G, P, entries = [{ d: 0, w: 1 }]) {
  const cells = [];
  for (let x = G.CELL / 2; x < G.W; x += G.CELL) for (let y = G.CELL / 2; y < G.H; y += G.CELL) cells.push({ x, y });
  const road = [];
  for (let d = 0; d < G.ROAD.len; d += 8) {
    const [x, y] = G.posAt(G.ROAD, d), pass = entries.reduce((a, e) => a + (e.d <= d ? e.w : 0), 0);
    road.push({ x, y, w: Math.exp(P.roadBias * (d / G.ROAD.len - .5)) * pass });
  }
  const total = road.reduce((a, r) => a + r.w, 0);
  const cov = {};
  for (const t of TYPES) {
    const D = G.TOWERS[t], lo = D.minRange || 0;
    cov[t] = cells.map(c => {
      if (t === "lantern") return 0;
      let s = 0; for (const r of road) { const d = Math.hypot(r.x - c.x, r.y - c.y); if (d <= D.range && d >= lo) s += r.w; }
      return s / total;
    });
    cov[t].order = cells.map((_, i) => i).sort((a, b) => cov[t][b] - cov[t][a]);
  }
  // spare grass: cells no tower would use much, good for saplings
  const spare = cells.map((c, i) => [i, Math.max(...TYPES.map(t => cov[t][i]))]).sort((a, b) => a[1] - b[1]).map(([i]) => i);
  return { cells, cov, spare, cellIdx: new Map(cells.map((c, i) => [c.x + "," + c.y, i])) };
}

/* ---------- helpers ---------- */
// damage per second of a tower type and level, before range bonuses. Cached for one build phase (seasons and
// events can change it between levels)
let dpsCache = new Map();
const dps = (G, type, lvl) => { const k = type + lvl; let v = dpsCache.get(k); if (v == null) { const s = G.tStats({ type, lvl }); dpsCache.set(k, v = s.dmg * s.rate); } return v; };
const shooters = S => S.towers.filter(t => t.type !== "frost" && t.type !== "lantern");

// a cell is usable if nothing blocks it except wild or grown trees, which the bot chops by hand first
function usable(G, c) {
  const why = G.canBuild(c.x, c.y);
  if (!why) return true;
  if (why !== "tree") return false;
  return !G.S.trees.some(t => !t.fall && !t.max && Math.hypot(t.x - c.x, t.y - c.y) < 30);   // saplings can't be chopped
}
function chopDown(G, t) { for (let i = 0; i < 20 && !t.fall; i++) G.chop(t); }
function clearCell(G, c) { for (const t of G.S.trees) if (!t.fall && Math.hypot(t.x - c.x, t.y - c.y) < 30) chopDown(G, t); }

/* ---------- one build phase ---------- */
export function newMemory(G, P) { return { map: mapInfo(G, P), pot: { towers: G.S.gold, castle: 0, economy: 0 }, lastGold: G.S.gold, log: [] }; }

export function buildPhase(G, P, M) {
  const S = G.S, L = S.level, E = P.era[eraOf(L)], pot = M.pot;
  dpsCache = new Map();
  // gold earned since last time is shared between the pots
  const income = S.gold - M.lastGold;
  if (income > 0) for (const k in pot) pot[k] += income * E.pot[k];
  const fit = () => { const sum = pot.towers + pot.castle + pot.economy; if (sum > S.gold) { const f = S.gold / sum; for (const k in pot) pot[k] *= f; } };
  fit();
  // spending comes out of a pot; anything the pot can't cover comes out of the others in turn
  const pay = (k, cost) => { let left = cost; for (const q of [k, "towers", "economy", "castle"]) { const take = Math.min(pot[q], left); pot[q] -= take; left -= take; } };
  const spend = (k, fn) => { const before = S.gold; fn(); const cost = before - S.gold; if (cost > 0) pay(k, cost); return cost; };

  // trees: wild ones all at once (once), grown saplings when ripe. Chopping by hand pays firewood, which counts as income
  if (P.chopAll && !M.choppedAll) { M.choppedAll = true; for (const t of S.trees) if (t.planted == null) chopDown(G, t); }
  for (const t of S.trees) if (t.planted != null && !t.fall && t.max && G.treeStage(t) >= P.harvestStage) chopDown(G, t);
  { const gain = S.gold - (M.lastGold + income); if (gain > 0) for (const k in pot) pot[k] += gain * E.pot[k]; }

  // a toll or a wizard asks before the level
  const ev = G.curEv();
  if (ev && G.EVENTS[ev.id].kind === "choice" && !ev.choice) {
    const c = G.EVENTS[ev.id].cost(L), limit = ev.id === "toll" ? P.toll : P.wizard;
    const yes = c <= S.gold * limit && S.gold >= c;
    if (yes) spend("towers", () => G.chooseEvent(true)); else G.chooseEvent(false);
  }

  // repairs before anything else
  while (S.hp < S.maxHp * P.repairAt && S.gold >= G.repairCost()) {
    const c = G.repairCost(); S.gold -= c; S.hp = Math.min(S.maxHp, S.hp + 5); pay("castle", c);
  }

  // economy: the treasury if it pays back in time, then saplings; whatever the economy can't use goes to towers
  {
    const gain = G.treasPay(S.treasury + 1, L) - G.treasPay(S.treasury, L), c = G.treasCost();
    const worth = gain > 0 && c / gain <= P.treasuryPayback && S.treasury < G.treasMax();
    if (worth && pot.economy >= c && S.gold >= c) { spend("economy", () => { S.gold -= c; S.treasury++; }); }
    // scavengers (rules v5): same payback rule, guessing a level's kill gold from the game's takings so far
    const SC = G.SCAV, n = S.scav || 0;
    if (SC && G.treasMax() !== Infinity && n < SC.max) {
      const sc = SC.cost(n), perLevel = S.stats.gold / Math.max(1, L - 1) * .8, sgain = perLevel * SC.pct / (1 + SC.pct * n);
      if (sgain > 0 && sc / sgain <= P.treasuryPayback && pot.economy >= sc && S.gold >= sc) spend("economy", () => { S.gold -= sc; S.scav = n + 1; });
    }
    const growing = S.trees.filter(t => t.planted != null && !t.fall).length;
    let want = Math.max(0, P.saplings - growing);
    for (const i of M.map.spare) {
      if (!want) break;
      const c2 = M.map.cells[i], pc = G.plantCost();
      if (pot.economy < pc || S.gold < pc) break;
      if (G.canBuild(c2.x, c2.y)) continue;
      if (spend("economy", () => G.plantSapling(c2.x, c2.y)) > 0) want--;
    }
    if (!worth || pot.economy > c * 1.5) { pot.towers += pot.economy; pot.economy = 0; }
  }

  // castle: the item with the best weight per gold, saving up for it
  for (let guard = 0; guard < 30; guard++) {
    const opts = [["walls", G.wallCost(), () => { S.walls++; S.maxHp += 5; S.hp += 5; }]];
    for (const k of ["archers", "mages", "moat", "masons"]) { const f = G.FORT[k], n = S.fort[k] || 0; if (n < f.max) opts.push([k, f.cost(n), () => { S.fort[k]++; }]); }
    let best = null;
    for (const [k, c, fn] of opts) { const sc = P.castle[k] / c; if (!best || sc > best.sc) best = { k, c, fn, sc }; }
    if (!best || pot.castle < best.c || S.gold < best.c) break;
    S.gold -= best.c; best.fn(); pay("castle", best.c);
  }

  // towers: new ones and upgrades, best value per gold, saving up unless patience runs out
  for (let guard = 0; guard < 60; guard++) {
    const opts = towerOptions(G, P, M, E);
    if (!opts.length) break;
    let best = opts[0]; for (const o of opts) if (o.score > best.score) best = o;
    const can = o => o.cost <= pot.towers && o.cost <= S.gold;
    let pick = can(best) ? best : null;
    if (!pick) { for (const o of opts) if (can(o) && o.score >= P.patience * best.score && (!pick || o.score > pick.score)) pick = o; }
    if (!pick) break;
    if (spend("towers", pick.run) <= 0) break;   // it didn't go through: stop rather than loop
  }
  M.lastGold = S.gold;
}

// everything the tower pot could buy now, scored as value per gold
function towerOptions(G, P, M, E) {
  const S = G.S, out = [], { cells, cov } = M.map;
  const sh = shooters(S), armyDps = sh.reduce((a, t) => a + dps(G, t.type, t.lvl), 0), meanDps = sh.length ? armyDps / sh.length : dps(G, "archer", 1);
  const dark = !!(G.season && G.season.gloom) || G.curEv()?.id === "fog";
  const lanternMul = 1 + (dark ? P.lanternDark : 0);
  // a Lantern only helps towers no other Lantern lights already (lights don't add up)
  const dark_ = sh.filter(t => !G.lightAt(t.x, t.y)).map(t => ({ x: t.x, y: t.y, d: dps(G, t.type, t.lvl) }));
  const litDps = (x, y, r, self) => (self ? sh.filter(t => G.lightAt(t.x, t.y) === self).map(t => ({ x: t.x, y: t.y, d: dps(G, t.type, t.lvl) })) : dark_)
    .reduce((a, t) => a + ((t.x - x) ** 2 + (t.y - y) ** 2 <= r * r ? t.d : 0), 0);
  const cellCov = (t, x, y) => { const i = M.map.cellIdx.get(x + "," + y); return i == null ? .5 : cov[t][i]; };
  for (const type of TYPES) {
    const w = E.w[type]; if (!w || G.lockOf(type)) continue;
    const cost = G.tCost(type);
    let cell = null, value = 0;
    if (type === "lantern") {
      if (dark_.length) for (const c of cells) { if (!usable(G, c)) continue; const v = litDps(c.x, c.y, G.TOWERS.lantern.range) * .1 * lanternMul; if (v > value) { value = v; cell = c; } }
    } else {
      for (const i of cov[type].order) { if (usable(G, cells[i])) { cell = cells[i]; value = cov[type][i] * (type === "frost" ? meanDps * .5 : dps(G, type, 1)); break; } }
    }
    if (!cell || value <= 0) continue;
    const c = cell;
    out.push({ score: w * value / cost, cost, run: () => { clearCell(G, c); G.placeTower(type, c.x, c.y); } });
  }
  for (const t of S.towers) {
    if (!E.w[t.type] && P.ban.includes(t.type)) continue;
    const cost = G.upCost(t);
    let gain;
    if (t.type === "lantern") gain = litDps(t.x, t.y, G.glowReach(t), t) * .02 * lanternMul;
    else if (t.type === "frost") gain = cellCov("frost", t.x, t.y) * meanDps * .1;
    else gain = cellCov(t.type, t.x, t.y) * (dps(G, t.type, t.lvl + 1) - dps(G, t.type, t.lvl));
    if (gain <= 0) continue;
    out.push({ score: E.upgrade * gain / cost, cost, run: () => { S.gold -= cost; t.spent += cost; t.lvl++; } });
  }
  return out;
}
