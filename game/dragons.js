// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
const DRAGON_NAMES = ["Ember", "Pip", "Saffron", "Bramble", "Marigold", "Puff", "Sparky", "Juniper", "Toast", "Wisp", "Clementine", "Smudge", "Biscuit", "Nutmeg", "Pebble", "Fennel", "Comet"];
// some names are special: the dragon gets a little bonus (and sometimes a new look) to go with it
const SECRET_DRAGONS = {
  cinder:    { name: "Cinder",     msg: "Cinder is as brown as chocolate, and Cinder's flames cling twice as long.", burn: 2,
               look: { body: "#7b4a2d", wing: "#5a321c", belly: "#d9b08c" } },
  freya:     { name: "Freya",      msg: "Freya fights like a warrior queen: +10% damage.",               dmg: 1.1 },
  sasha:     { name: "Sasha",      msg: "Sasha is lightning quick: breathes fire 15% faster.",           rate: 1.15 },
  bean:      { name: "Bean",       msg: "Bean stays teeny forever, but anything Bean defeats drops 25% more gold.", gold: 1.25, tiny: true },
  nibnib:    { name: "Nibnib",     msg: "Nibnib has the sharpest eyes in the valley: +15% range.",       range: 1.15 },
  nightfury: { name: "Night Fury", msg: "Scales as dark as midnight and purple fire: +10% damage, +25% at night.", dark: true },
  baby:      { name: "Baby",       msg: "Baby will always be a baby. While Baby is on guard, the castle mends a heart after every level.", tiny: true, mend: 1 },
  mushu:     { name: "Mushu",      msg: "Mushu is small, pink and part axolotl, but very fierce: breathes fire 10% faster, and the flames cling 50% longer.", tiny: true, rate: 1.1, burn: 1.5,
               look: { body: "#f4a3bf", wing: "#e57fa4", belly: "#fcd8e3", gill: "#d9467f", axolotl: true } },
  lauren:    { name: "Lauren",     msg: "Lauren's fire sweeps wide: the flames splash 40% further.",     splash: 1.4, rv: 5 },
};
