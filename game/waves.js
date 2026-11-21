// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
// enemy health compounds 5% a level up to 50, then 4.5% after that, so level 100 is a real achievement
const HP5 = 1.0035;   // rules v5: monsters get a little tougher each level, to balance towers growing faster with upgrades
const hpScale = L => (1 + 0.12 * (L - 1)) * Math.pow(1.05, Math.min(L, 50) - 1) * Math.pow(1.045, Math.max(0, L - 50)) * (rules5() ? Math.pow(HP5, L - 1) : 1);
const goldScale = L => 1 + 0.06 * (L - 1);

function makeWave(L) {
  const avail = Object.keys(ENEMIES).filter(k => foeFrom(k) <= L), g = slimeGrow(L);
  const wt = k => ENEMIES[k].w * (k === "slime" ? .5 + .5 * g : 1) * ((MAP.foes && MAP.foes[k]) || 1);   // young slimes turn up less often
  const pickFrom = ks => { const total = ks.reduce((a, k) => a + wt(k), 0); let r = Math.random() * total; for (const k of ks) { r -= wt(k); if (r <= 0) return k; } return ks[0]; };
  const pick = () => pickFrom(avail);
  const boss = L % 10 === 0;
  const count = Math.min(8 + Math.floor(L * 0.9), 45) - (boss ? 4 : 0);
  const gap = Math.max(0.38, 1.0 - L * 0.01);
  const q = [];
  let k = pick(), fill = k;
  for (let i = 0; i < count; i++) {
    if (i % 4 === 0) { k = pick(); if (k === "slime" && slimeRun(g) < 4) fill = pickFrom(avail.filter(a => a !== "slime")); }  // small groups of the same kind
    const kk = k === "slime" && i % 4 >= slimeRun(g) ? fill : k;   // young slimes come in pairs, and something else fills the group
    q.push({ k: kk, gap: ENEMIES[kk].fly ? gap * 1.2 : gap });
  }
  if (boss) q.push(...bossItems(L));
  return q;
}
