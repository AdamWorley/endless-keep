// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
const TOWERS = {
  // each tower has a clear job and a clear weakness:
  //   archers fire fast but each arrow is light, so armour blunts them badly (armorMul);
  //   mages pierce armour but are slow and expensive; catapults hit hard over a wide area but slowly, and can't aim
  //   at anything right beside them (minRange); frost does little damage (none in rules v5: see TUNE5); the dragon does everything but costs a fortune
  archer:   { name: "Archer Tower", cost: 40,  range: 140, dmg: 5.5, rate: 2.0, air: true, magic: false, splash: 0, armorMul: 1.6, role: "Fast · air", desc: "Cheap, rapid arrows. Hits flying foes, but armour turns them aside.", best: "Bats, wolves, wolf riders and goblins. Poor against armour: skeleton knights shrug most arrows off." },
  mage:     { name: "Mage Tower",   cost: 100, range: 125, dmg: 32, rate: 0.5, air: true,  magic: true,  splash: 0,  role: "Armour", desc: "Slow, powerful bolts that pierce armour. One target at a time.", best: "Skeleton knights, trolls, orcs and bosses: magic ignores armour. Hits one monster at a time, so it struggles with big packs." },
  frost:    { name: "Frost Spire",  cost: 70,  range: 115, dmg: 4,  rate: 0.8, air: true,  magic: true,  splash: 48, slow: 0.45, role: "Slow", desc: "Slows everything it touches.", best: "Trolls, fast wolves and riders, and bosses. Low damage, so place it beside your hard hitters." },
  catapult: { name: "Catapult",     cost: 110, range: 185, dmg: 50, rate: 0.28, air: false, magic: false, splash: 64, minRange: 60, role: "Crowds", desc: "Slow, heavy boulders that crush whole packs. Ground only.", best: "Big packs of goblins and orcs on the road. Can't hit bats or wyverns, or anything right beside it, so build it back from the road." },
  lantern:  { name: "Lantern",      cost: 60,  range: 110, dmg: 0,  rate: 0,   air: true,  magic: false, splash: 0, role: "Light", desc: "Doesn't fight. It lights up the grass round it: towers in its light see through darkness and fog, and monsters in its light take 10% more damage.", best: "Night and foggy levels. Put it between your towers so its light reaches several of them." },
  dragon:   { name: "Dragon Roost", cost: 350, range: 155, dmg: 26, rate: 1.1, air: true,  magic: true,  splash: 40, burn: true, role: "All-round", desc: "Your own dragon breathes fire. Unlocks partway through a game.", best: "Anything, flying or armoured. Its fire keeps burning, which is great against healing trolls." },
};
const DRAGON_STAGES = [
  { upto: 3,   name: "Hatchling",    s: .8,   body: "#3f9a6a", wing: "#2f7a52", belly: "#9fd39a", fire: ["rgba(255,140,50,.4)", "#ffb347", "#fff0a8"] },
  { upto: 6,   name: "Young dragon", s: 1,    body: "#3d7fb5", wing: "#2b5f8c", belly: "#a7cdea", fire: ["rgba(255,140,50,.45)", "#ff9d3a", "#fff0a8"] },
  { upto: 9,   name: "Grown dragon", s: 1.15, body: "#7b52b3", wing: "#5a3790", belly: "#cdb0ee", fire: ["rgba(190,120,255,.42)", "#c58bff", "#f3e6ff"] },
  { upto: 1e9, name: "Great wyrm",   s: 1.32, body: "#d4a017", wing: "#a8790c", belly: "#f6df8f", fire: ["rgba(255,230,120,.5)", "#ffe27a", "#ffffff"] },
];
const dragonStage = lvl => DRAGON_STAGES.find(d => lvl <= d.upto);
//#include game/dragons.js
const secretKey = n => String(n || "").toLowerCase().replace(/[^a-z]/g, "");
// a name added in a later rules version gives no bonus in a game started under older rules
const dragonSecret = t => { const sp = t && t.type === "dragon" && SECRET_DRAGONS[secretKey(t.name)]; return sp && !(sp.rv && S && S.rv && S.rv < sp.rv) ? sp : null; };
function onDragonNamed(t) {
  const sp = dragonSecret(t); if (!sp) return;
  toast(`${sp.msg}`); sfx("up");
  unlock("namesake");
  const k = secretKey(t.name);
  if (!meta.names.includes(k)) { meta.names.push(k); saveMeta(); }
  if (Object.keys(SECRET_DRAGONS).every(id => meta.names.includes(id))) unlock("whisperer");
}
// every dragon needs its own name, so a special name's bonus only goes to one dragon.
// Names match ignoring case, and special names also ignore spaces and symbols ("Freya!" is still Freya).
const dragonNameKey = n => { const k = secretKey(n); return SECRET_DRAGONS[k] ? "#" + k : String(n || "").trim().toLowerCase(); };
const dragonNameTaken = (n, self) => !!n && (S ? S.towers : []).some(t => t !== self && t.type === "dragon" && t.name && dragonNameKey(t.name) === dragonNameKey(n));
function suggestDragonName(self) {
  const free = DRAGON_NAMES.filter(n => !dragonNameTaken(n, self));
  if (free.length) return free[Math.floor(Math.random() * free.length)];
  const base = DRAGON_NAMES[Math.floor(Math.random() * DRAGON_NAMES.length)];
  for (let i = 2; ; i++) if (!dragonNameTaken(`${base} ${i}`, self)) return `${base} ${i}`;
}
const cleanDragonName = v => Array.from(safeName(v)).slice(0, 14).join("").trim();  // dragons get the same name filter
const dragonLabel = t => t.name || "Your dragon";
const TORDER = ["archer", "mage", "frost", "catapult", "lantern", "dragon"];
const SHORT = { archer: "Archer", mage: "Mage", frost: "Frost", catapult: "Catapult", lantern: "Lantern", dragon: "Dragon" };
// grown trees near a tower act as lookouts: +5% range each, up to three trees (saplings don't count yet)
const TREE_REACH = 75, TREE_BONUS = .05, TREE_MAX = 3;
const lookoutTrees = t => (S && t.x != null && t.type !== "lantern") ? S.trees.filter(tr => !tr.fall && tr.max && Math.hypot(tr.x - t.x, tr.y - t.y) < TREE_REACH).slice(0, TREE_MAX) : [];
// rules v4: each season has its own rules (see SEASONS). A game started under older rules keeps playing without them
const newRules = () => !S || !S.rv || S.rv >= 4;
const sRule = k => (newRules() && season && season[k]) || 0;
const walkMul = e => e.fly ? 1 : sRule("walk") || 1;   // deep snow slows monsters on foot, not fliers
const rules5 = () => !S || !S.rv || S.rv >= 5;
// rules v5: Archer Towers change as they grow. From level 5 they're Longbows: more reach, and arrows that bite a little
// deeper into armour. From level 10 they're Dragon Ballistas: slow, heavy bolts built to bring down dragons, which hit
// fliers 50% harder and aren't blunted by armour any more than a mage's bolt is (armour still counts, just normally).
// The castle archers stay plain archers. Games started under older rules keep plain archers all the way up.
const ARCHER_TIERS = [
  { from: 10, name: "Dragon Ballista", short: "Ballista", range: 1.25, dmg: 1.6, rate: .65, armorMul: 1,   airMul: 1.5, shot: "bolt" },
  { from: 5,  name: "Longbow Tower",   short: "Longbow",  range: 1.2,  dmg: 1,   rate: 1,   armorMul: 1.3 },
];
const archerTier = t => (t && t.type === "archer" && !t.keep && rules5() && ARCHER_TIERS.find(z => t.lvl >= z.from)) || null;
// Mage, Frost and Catapult towers change their look (and name) at levels 5 and 10, as Archer Towers do; unlike the
// archers' tiers, these are only looks. Lanterns and Dragon Roosts already grow in their own way
const LOOKS = { mage: ["Mage Tower", "Wizard's Tower", "Arcane Spire"], frost: ["Frost Spire", "Ice Spire", "Glacier Spire"], catapult: ["Catapult", "Heavy Catapult", "Trebuchet"] };
const lookOf = lvl => lvl >= 10 ? 2 : lvl >= 5 ? 1 : 0;
const towerName = t => archerTier(t) ? archerTier(t).name : LOOKS[t.type] ? LOOKS[t.type][lookOf(t.lvl)] : TOWERS[t.type].name;
// a Lantern lights the grass round it: towers in its light ignore darkness and fog, and monsters in it take extra damage.
// Lights don't add up: the brightest one wins
const glowReach = t => TOWERS.lantern.range * Math.min(1.6, 1 + .04 * (t.lvl - 1));
// rules v5: capped at +20% (level 6) instead of +30% (level 11)
const glowBonus = t => Math.min(rules5() ? .2 : .3, .1 + .02 * (t.lvl - 1));
// every monster hit asks this, so the Lanterns are listed once per tick (or when towers are added or sold), not per hit
let lightList = [], lightOf = null, lightLen = -1, lightTime = -1;
function lightAt(x, y) {
  if (!S) return null;
  if (lightOf !== S.towers || lightLen !== S.towers.length || lightTime !== time) {
    lightOf = S.towers; lightLen = S.towers.length; lightTime = time;
    lightList = S.towers.filter(l => l.type === "lantern").map(l => ({ l, x: l.x, y: l.y, r2: glowReach(l) ** 2, b: glowBonus(l) }));
  }
  let best = null, bb = -1;
  for (const o of lightList) if (o.b > bb && (o.x - x) ** 2 + (o.y - y) ** 2 <= o.r2) { best = o.l; bb = o.b; }
  return best;
}
const litTowers = l => S.towers.filter(t => t.type !== "lantern" && Math.hypot(l.x - t.x, l.y - t.y) <= glowReach(l));
// rules v5 tuning, from bot tests where only frost and catapults earned their place: each level now adds 55% damage,
// the same as an upgrade's extra cost (it was 50%, so a carpet of cheap towers beat a few strong ones; now an upgrade
// is worth as much per gold as a new tower, and saves a build spot and adds range). Monsters gain 0.35% health a
// level to match (HP5), so overall difficulty stays where it was. Mages hit 25% harder so they really are the answer
// to trolls and knights, and dragon upgrades are priced as if the roost cost 200, not 350.
// The Frost Spire is a support tower like the Lantern: it does no damage, only chills (and so Jasmine never hexes it)
const TUNE5 = { mage: { dmg: 40 }, frost: { dmg: 0, desc: "Doesn't hurt anything: it chills everything in its blast, so monsters stay longer in reach of your other towers.",
  best: "Trolls, fast wolves and riders, and bosses. Place it where your hard hitters can reach what it slows." } };
const towerDef = k => rules5() && TUNE5[k] ? { ...TOWERS[k], ...TUNE5[k] } : TOWERS[k];
const lvlDmg = n => Math.pow(rules5() ? 1.55 : 1.5, n);
const upBase = k => k === "dragon" && rules5() ? 200 : TOWERS[k].cost;
function tStats(t) {
  const d = towerDef(t.type), n = t.lvl - 1, sp = dragonSecret(t) || {};
  if (t.type === "lantern") return { dmg: 0, range: glowReach(t), rate: 0, slow: 0, bonus: glowBonus(t) };
  const lit = t.x != null && !!lightAt(t.x, t.y), dim = (evOn("fog") || vsOn("fog") ? .8 : 1) * (sRule("gloom") || 1);
  const spDmg = (sp.dmg || 1) * (sp.dark ? (season && season.night ? 1.25 : 1.1) : 1), tier = archerTier(t) || {};
  return {
    dmg: d.dmg * lvlDmg(n) * (1 + .06 * perk(TYPE_PERK[t.type]) + .1 * perk("crown") + .05 * dyn()) * (evOn("wizard") ? 1.3 : 1) * spDmg * (tier.dmg || 1),
    range: d.range * Math.min(1.6, 1 + 0.04 * n) * (1 + TREE_BONUS * lookoutTrees(t).length + .04 * perk("eagle")) * (lit ? 1 : dim) * (sRule("sight") || 1) * (sp.range || 1) * (tier.range || 1),
    rate: d.rate * Math.min(1.5, 1 + 0.03 * n) * (1 + .08 * perk("volley")) * (sp.rate || 1) * (tier.rate || 1),
    slow: d.slow ? Math.min(0.8, d.slow + 0.02 * n + .03 * perk("chill")) : 0,
    armorMul: tier.armorMul || d.armorMul || 1, airMul: tier.airMul || 1, shot: tier.shot,
  };
}
const upCost = t => Math.round(upBase(t.type) * 0.75 * Math.pow(1.55, t.lvl - 1) * (1 - .05 * perk("masonry")));
// rules v5: each tower of a kind already on the map makes the next one of that kind 6% dearer (the 11th archer
// costs 64 instead of 40), so a carpet of one kind costs more than a mix, and upgrading becomes the cheaper way to grow.
// Dragons go up 15% a roost: bots re-trained on these rules built 25-30 roosts and nothing else that fights
const CROWD = .06, crowdOf = k => k === "dragon" ? .15 : CROWD;
const tCost = k => Math.round(TOWERS[k].cost * (1 - .05 * perk("quarter")) * (rules5() && S ? 1 + crowdOf(k) * S.towers.filter(t => t.type === k).length : 1));
const dragonAt = () => perk("egg") ? 5 : 10;
// why a defender can't be built yet: tag for the bar, words for the panel. Lanterns came with rules v4, so older saved games don't get them
// rules v5: Lanterns unlock on the first night level (41), when you first need them
function nightFrom() { return 10 * SEASONS.findIndex(z => z.night) + 1; }
const lanternLocked = () => rules5() && S && (S.vs && S.vs.live ? vsSeason() < SEASONS.findIndex(z => z.night) : S.level < nightFrom());
const lockOf = k => k === "dragon" && !S.dragon ? { tag: `Level ${dragonAt()}`, why: `The Dragon Roost unlocks after level ${dragonAt()}.`, hint: `Unlocks after you clear level ${dragonAt()}.` }
  : k === "lantern" && lanternLocked() ? { tag: `Level ${nightFrom()}`, why: `Lanterns unlock when night first falls, at level ${nightFrom()}.`, hint: `Unlocks at level ${nightFrom()}, the first night.` }
  : k === "lantern" && !newRules() ? { tag: "New game", why: "Lanterns came after this game began. Start a new game to build them.", hint: "Lanterns came after this game began. Start a new game to build them." } : null;
