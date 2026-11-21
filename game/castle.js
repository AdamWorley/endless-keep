// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
const repairCost = () => 20 + 4 * S.level;
const wallCost = () => Math.round(80 * Math.pow(1.6, S.walls));
// the treasury pays a lump sum each time you clear a level (it used to trickle gold per second during a level,
// which paid less as waves got shorter and more when frost dragged them out)
const treasCost = () => Math.round(100 * Math.pow(1.6, S.treasury));
const treasPay = (n = S.treasury, L = S.level) => Math.round(n * 18 * goldScale(L));
// rules v5: the treasury stops at level 8. Beyond that a level cost more than it could ever pay back
// (level 9 is ~6900 gold for under 100 more a level), so it was only a trap
const TREAS_MAX = 8, treasMax = () => rules5() ? TREAS_MAX : Infinity;
// rules v5: scavengers pick over the fallen, +5% gold from every monster defeated per level, up to 5 levels
const SCAV = { max: 5, pct: .05, cost: n => Math.round(150 * Math.pow(1.75, n)) };
// fortifications bought at the castle
const FORT = {
  // castle archers level n shoot like a level n + 3 Archer Tower (same heirloom bonuses, same armour weakness) with a
  // long 300 range from the battlements, but cost the same as a level n + 2 one: they only see monsters that got past
  // every tower (plus every flier, which heads straight for the castle), so they need the extra punch. Jasmine can't hex them.
  archers: { name: "Castle archers", max: 99, cost: n => Math.round(n ? 37.5 * Math.pow(1.55, n + 1) : 145),
             desc: n => n ? `Level ${n}: shoot like a level ${n + 3} Archer Tower with long range. ${Math.round(keepStats(n).dmg)} damage, ${keepStats(n).rate.toFixed(1)} shots/sec. Next: ${Math.round(keepStats(n + 1).dmg)} damage.`
                          : "Archers on the battlements shoot anything near the castle, flying or not. They fire like a level 4 Archer Tower with long range, need no build spot, and can't be hexed." },
  // castle mages (rules v5) are the same deal for Mage Towers: level n casts like a level n + 3 Mage Tower from the keep,
  // for the price of a level n + 2 one. Slow, heavy bolts that ignore armour, for the knights and bosses that get through
  mages:   { name: "Castle mages",   max: 99, cost: n => Math.round(n ? 75 * Math.pow(1.55, n + 1) : 290),
             desc: n => n ? `Level ${n}: cast like a level ${n + 3} Mage Tower with long range. ${Math.round(keepStats(n, "mage").dmg)} damage, ${keepStats(n, "mage").rate.toFixed(2)} shots/sec. Next: ${Math.round(keepStats(n + 1, "mage").dmg)} damage.`
                          : "A mage in the keep's tower casts at anything near the castle, flying or not. Bolts pierce armour, like a level 4 Mage Tower with long range. Needs no build spot and can't be hexed." },
  moat:    { name: "Moat",           max: 3,  cost: n => Math.round(150 * Math.pow(2, n)),
             desc: n => `Ground monsters wade through the water by the gate, slowed by ${n * 12}%${n < 3 ? ` (next: ${(n + 1) * 12}%)` : ""}.` },
  // rules v5: each mason patches 1 heart a level, not 2 (five could take the walls from half to full every level);
  // the castle starts with 30 hearts instead of 20 to make up for it
  masons:  { name: "Masons",         max: 5,  cost: n => Math.round(120 * Math.pow(1.8, n)),
             desc: n => `Patch up ${n * masonMend()} heart${n * masonMend() === 1 ? "" : "s"} for free after every level you clear${n < 5 ? ` (next: ${(n + 1) * masonMend()})` : ""}.` },
  // Harbour cliffs only: fliers come in off the sea there, so nets slow them as they near the castle, as the moat does
  // the ground monsters at the gate
  nets:    { name: "Sea nets",       max: 3,  cost: n => Math.round(150 * Math.pow(2, n)),
             desc: n => `Nets strung from the cliff tangle fliers coming in off the sea, slowed by ${n * 12}% near the castle${n < 3 ? ` (next: ${(n + 1) * 12}%)` : ""}.` },
};
const NETS_REACH = 220;   // how near the castle's gate fliers have to be to tangle in the sea nets
const keepStats = (n, type = "archer") => ({ ...tStats({ type, lvl: n + 3, keep: true }), range: 300 * (evOn("fog") || vsOn("fog") ? .8 : 1) * (sRule("sight") || 1) });  // the castle is lit at night
const KEEP = { type: "archer", x: CASTLE.x + 62, y: CASTLE.y + 50, cd: 0, ang: 0, flash: 0, keep: true };
const KEEP_MAGE = { type: "mage", x: CASTLE.x + 70, y: CASTLE.y + 96, cd: 0, ang: 0, flash: 0, keep: true };   // bolts leave the staff's orb, 66 above
const masonMend = () => rules5() ? 1 : 2;
const FORT_KEYS = () => (rules5() ? ["archers", "mages", "moat", "masons"] : ["archers", "moat", "masons"]).concat(rules5() && MAP.sea ? ["nets"] : []);
