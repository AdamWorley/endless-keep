// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
const ENEMIES = {
  goblin: { name: "Goblins",          hp: 1,    spd: 52, armor: 0,   gold: 4,  from: 1,  r: 9,  col: "#7fb04a", dmg: 1, w: 5 },
  wolf:   { name: "Wolves",           hp: 0.6,  spd: 92, armor: 0,   gold: 4,  from: 3,  r: 10, col: "#9aa0a6", dmg: 1, w: 3 },
  orc:    { name: "Orcs",             hp: 2.6,  spd: 40, armor: .15, gold: 8,  from: 5,  r: 12, col: "#6b7a3a", dmg: 2, w: 3 },
  bat:    { name: "Cave bats",        hp: 0.55, spd: 68, armor: 0,   gold: 4,  from: 7,  r: 7,  col: "#5b4a7a", dmg: 1, w: 2, fly: true },
  wolfrider: { name: "Goblin wolf riders", hp: 1.05, spd: 84, armor: 0, gold: 6, from: 9, r: 12, col: "#9aa0a6", dmg: 1, w: 2, rider: true },
  knight: { name: "Skeleton knights", hp: 3,    spd: 36, armor: .5,  gold: 10, from: 12, r: 11, col: "#d8d4c8", dmg: 2, w: 2 },
  troll:  { name: "Trolls",           hp: 6.2,  spd: 28, armor: .1,  gold: 16, from: 16, r: 15, col: "#6f8a99", dmg: 3, w: 1.5, regen: .015 },
  wyvern: { name: "Wyverns",          hp: 3.2,  spd: 50, armor: .1,  gold: 14, from: 22, r: 12, col: "#3f8f7a", dmg: 2, w: 1.5, fly: true },
  // rules v5: slimes split when they die (split: what into, how many, or [fewest, most]), and all slimes heal.
  // Slimelets only ever come out of a slime: each is about an orc, without the armour but healing. A slime and its
  // a slime bursts into 6 slimelets. Hearts add up the family, so killing one is never worse than letting it through:
  // a slimelet takes 1, a slime 7 (a bit more than its 6 slimelets), the Slime Cube 15 (a bit more than its 2 slimes).
  // With the smaller family (bots went 123 -> 135 levels) slimes got hardier: health 4 -> 6, slimelets 2.6 -> 3.5.
  // That overdid it: from level 100 they took twice the hearts trolls did and walked through defences that stopped
  // everything else, so they came back down to 3.6 and 2.1, where they get about as far as trolls do
  slime:    { name: "Slimes",           hp: 3.6,  spd: 36, armor: 0,   gold: 6,  from: 51, r: 12, col: "#7fd36a", dmg: 7, w: 1.2, regen: .015, split: { k: "slimelet", n: 6 }, rv: 5 },
  slimelet: { name: "Slimelets",        hp: 2.1,  spd: 40, armor: 0,   gold: 6,  from: Infinity, r: 9, col: "#97e07f", dmg: 1, w: 0, regen: .015, rv: 5 },
  orcrider: { name: "Orc raiders",    hp: 2.7,  spd: 66, armor: .15, gold: 12, from: 26, r: 14, col: "#6e6a66", dmg: 2, w: 1.5, rider: true },
};
// rules v4 made trolls a little easier (they had 6.5 health and healed 2% a second); games started earlier keep the old troll
// monsters from a later rules version stay out of games started under older rules
const foeFrom = k => ENEMIES[k].rv && !rules5() ? Infinity : ENEMIES[k].from;
const foeDef = k => k === "troll" && !newRules() ? { ...ENEMIES.troll, hp: 6.5, regen: .02 } : ENEMIES[k];
// slimes ease in (rules v5): the first ones, at level 51, came at full strength and walked through most defences. Now
// they grow up over SLIME_RAMP levels: at first they have 85% of the health, burst into 3 slimelets (just as weak) instead
// of 6, turn up half as often and only in pairs. By level 61 they're back to full strength, with full groups of 4.
// Slimes out of a Slime Cube are always full grown
const SLIME_RAMP = 10;
const slimeGrow = L => rules5() ? Math.max(0, Math.min(1, (L - ENEMIES.slime.from) / SLIME_RAMP)) : 1;
const slimeHp = g => .85 + .15 * g, slimeSplit = g => 3 + Math.round(3 * g), slimeRun = g => 2 + Math.round(2 * g);
const BOSSES = [
  // again (rules v5): from the second time round (level 60 on) each boss comes back as a second form with one new
  // trick, and brings an escort of its own kind that grows every time round (see bossItems)
  { key: "trollking", name: "Troll King",   hp: 26, spd: 22, armor: .25, gold: 150, r: 24, col: "#56707f", dmg: 6,
    again: { name: "Iron Troll King", armor: .45, regen: .01, escort: "troll", aura: "#b9c9d4", desc: "He comes back in iron plate that turns arrows and boulders, and his wounds close as you watch. A troll guard marches ahead of him." } },
  { key: "bigdragon", name: "Elder Dragon", hp: 21, spd: 26, armor: .2,  gold: 200, r: 26, col: "#b8402c", dmg: 6, fly: true,
    again: { name: "The Elder Dragons", named: true, pair: true, hpMul: .6, escort: "wyvern", aura: "#ff9a5a", desc: "She comes back with her mate: two Elder Dragons at once, each a little smaller than she was alone. Wyverns fly ahead of them." } },
  { key: "wyrm",      name: "Bone Wyrm",    hp: 32, spd: 20, armor: .45, gold: 250, r: 24, col: "#e6dfcc", dmg: 6,
    again: { name: "Undying Wyrm", rise: .5, escort: "knight", aura: "#7ef0ff", desc: "Knock it down and it pulls itself back together once, at half health. Skeleton knights march ahead of it." } },
  // flies on a broomstick and hexes whichever tower hurts her (it stops firing for 2 seconds), one tower every 1.5 seconds
  { key: "jasmine",   name: "Jasmine the Witch", hp: 18, spd: 24, armor: .1, gold: 300, r: 24, col: "#4a3a63", dmg: 6, fly: true, hex: 1.5, named: true,
    again: { name: "Jasmine, Queen of Hexes", hex: .75, escort: "bat", aura: "#c9a8ff", desc: "She hexes a tower twice as often, and a cloud of bats flies ahead of her broomstick." } },
  // rules v5, level 50: a great cube of jelly that bursts into two slimes, each of which bursts into 6 slimelets
  { key: "slimecube", name: "Slime Cube",   hp: 22, spd: 20, armor: 0,   gold: 200, r: 24, col: "#6cc35a", dmg: 15, regen: .01, split: { k: "slime", n: 2 }, rv: 5,
    again: { name: "Great Slime Cube", dmg: 22, split: { k: "slime", n: 3 }, escort: "slime", aura: "#b6ef9a", desc: "Even bigger inside, it bursts into three slimes instead of two, and takes 22 hearts if it reaches the castle. Slimes ooze ahead of it." } },
];
const bossList = () => rules5() ? BOSSES : BOSSES.filter(b => !b.rv);
// how many times round the bosses have already been by level L (0 the first time, 1 from level 60…)
const bossRound = L => Math.floor((L / 10 - 1) / bossList().length);
const bossFor = L => {
  const list = bossList(), b = list[(L / 10 - 1) % list.length], back = rules5() && b.again ? bossRound(L) : 0;
  return back ? { ...b, ...b.again, back, first: b } : b;
};
const bossAura = k => ((BOSSES.find(b => b.key === k) || {}).again || {}).aura;
// what a boss level adds to the end of its wave: a returning boss's escort (2 more each time round, up to 12), then
// the boss itself (two of them for a pair)
function bossItems(L) {
  const b = bossFor(L), q = [];
  if (b.back && b.escort) for (let i = 0; i < Math.min(12, 2 * b.back + 2); i++) q.push({ k: b.escort, gap: .45 });
  for (let i = 0; i < (b.pair ? 2 : 1); i++) q.push({ k: "boss", gap: b.pair && !i ? 1.4 : 2.5 });
  return q;
}
