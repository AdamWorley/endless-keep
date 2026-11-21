// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
/* ---------- hexed trees: the wishing fish's opposite, in Gloaming Wood ----------
   About one tree in five there is hexed (it watches you with faint glowing eyes). Fell one, by hand or by woodcutter,
   and its curse falls on you: one of four, for the rest of this level and the next HEX_LEVELS. A new curse takes the
   old one's place. */
const HEXES = {
  rot:   { name: "Withered arms", say: "Cut me down, would you? Then may your towers' arms grow weak.", desc: "Your towers deal 15% less damage." },
  murk:  { name: "Clouded eyes",  say: "Let a mist settle on your watchers' eyes.",                     desc: "Your towers see 15% less far." },
  hurry: { name: "Quickened feet", say: "Run, little monsters, run! The keep is waiting.",               desc: "Monsters move 15% faster." },
  pinch: { name: "Empty purse",   say: "Wood for gold? Then gold for wood. Your purse will feel it.",   desc: "Monsters drop 30% less gold." },
};
const HEX_LEVELS = 2;
const hexLeft = () => S && S.hex && S.level <= S.hex.until ? S.hex.until - S.level + 1 : 0;
const hexOn = id => !!hexLeft() && S.hex.id === id;
// which of a forest's trees are hexed: fixed by the tree, so every keeper meets the same ones
const hexedTree = id => MAP.hexTrees && id >= 500 && id < 1000 && (id * 7919) % 100 < MAP.hexTrees * 100;
function hexFalls(t) {
  if (!t.hex || S.vs) return;
  const ids = Object.keys(HEXES), id = ids[(Math.random() * ids.length) | 0], H = HEXES[id];
  S.hex = { id, until: S.level + HEX_LEVELS }; sfx("boss");
  for (let i = 0; i < 18; i++) { const a = Math.random() * 6.28, sp = 30 + Math.random() * 60; S.fx.push({ x: t.x, y: t.y - 14, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: .8, max: .8, col: i % 2 ? "rgba(170,110,255,.95)" : "rgba(90,230,160,.9)", r: 2.4, g: 30 }); }
  const was = paused; paused = true;
  openModal(card => {
    const head = el("div", "evpop"), words = el("div");
    words.append(el("h2", "", `A curse: ${H.name}`), el("p", "say", `“${H.say}”`), el("p", "", `${H.desc} It lasts for the rest of this level and the next ${HEX_LEVELS}.`));
    head.append(evPortrait("tree"), words); card.append(head);
    const r = el("div", "row"), ok = el("button", "primary", "So be it"); ok.addEventListener("click", closeModal); r.append(ok); card.append(r);
  }, () => { paused = was; renderUpNext(); renderPanel(); updateHud(); });
  schedulePersist();
}
// a hexed tree's eyes, glowing in its trunk; they blink now and then
function drawHexEyes(t) {
  const c = ctx, blink = Math.sin(time * 1.3 + t.id) > .96, y = t.y - 15 * t.s, a = .75 + .25 * Math.sin(time * 2 + t.id), dx = 4.5 * t.s;
  c.save();
  const gr = c.createRadialGradient(t.x, y, 0, t.x, y, 12 * t.s); gr.addColorStop(0, `rgba(200,255,140,${.35 * a})`); gr.addColorStop(1, "rgba(200,255,140,0)");
  c.fillStyle = gr; c.fillRect(t.x - 12 * t.s, y - 12 * t.s, 24 * t.s, 24 * t.s);
  c.fillStyle = `rgba(235,255,170,${a})`;
  if (blink) { c.fillRect(t.x - dx - 2.5 * t.s, y, 5 * t.s, 1.2); c.fillRect(t.x + dx - 2.5 * t.s, y, 5 * t.s, 1.2); }
  else {
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(t.x + s * dx, y, 2.6 * t.s, 1.7 * t.s, s * -.35, 0, Math.PI * 2); c.fill(); }   // slanted, narrowed eyes
    c.fillStyle = "#1c120a"; ell(c, t.x - dx + .6, y, .9 * t.s, 1.2 * t.s); ell(c, t.x + dx - .6, y, .9 * t.s, 1.2 * t.s);
  }
  c.restore();
}
