// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
/* ---------- the wishing fish ----------
   Now and then a golden fish surfaces in the pond during a level (about one level in four, from level 3; never in
   winter, when the pond is frozen, or while a wish is still working). Tap it (anywhere on the pond), or press W, before it dives and it grants a
   wish: one of three heirlooms' bonuses for the rest of this level and the next WISH_LEVELS. It runs on real time in
   the frame loop, outside the game's own update, so it's as easy to catch at 3x speed and the bots never meet it. */
const POND = { x: 400, y: 80, rx: 44, ry: 13 }, FISH_STAY = 8;
let fish = null, fishL = 0;   // fishL: the level the fish has already been decided for
function fishTick(dt) {
  if (fish) {
    fish.t += dt;
    if (fish.t >= 0 && !fish.told) { fish.told = true; toast("A golden fish is up in the pond! Tap the pond (or press W) before it dives to make a wish."); }
    if (fish.gone) { if (fish.t > fish.goneAt + .8) fish = null; }
    else if (fish.t > FISH_STAY) { fish.gone = true; fish.goneAt = fish.t; }
    else { const a = fish.a0 + fish.t * .7 * fish.dir; fish.x = POND.x + Math.cos(a) * POND.rx; fish.y = POND.y + Math.sin(a) * POND.ry; fish.face = -Math.sin(a) * fish.dir >= 0 ? 1 : -1; }
  }
  if (S.wish && !wishLeft()) { toast(`Your wish has faded: ${PERKS[S.wish.id].name} is back to normal.`); S.wish = null; schedulePersist(); renderUpNext(); }
  if (S.phase !== "wave" || fishL === S.level || S.vs || watchOnly() || !newRules() || !rules5()) return;
  fishL = S.level;
  if (S.level < 3 || season.frozen || MAP.pond === false || S.wish || Math.random() > .25) return;
  fish = { t: -(3 + Math.random() * 12), a0: Math.random() * 6.28, dir: Math.random() < .5 ? 1 : -1, x: POND.x, y: POND.y, face: 1 };   // surfaces 3-15 s into the level
}
function drawFishShape(c, x, y, s, face, wig) {
  c.save(); c.translate(x, y); c.scale(face * s, s);
  c.fillStyle = "#e07a1f"; tri(c, -9, 0, -16, -6 + wig, -16, 6 + wig);                      // tail
  c.fillStyle = "#f2a33a"; ell(c, 0, 0, 10, 5.2);                                           // body
  c.fillStyle = "#ffd36b"; ell(c, 1.5, -1.4, 6.5, 2.4);                                     // golden back
  c.fillStyle = "#e07a1f"; tri(c, -2, -4.4, 4, -4.6, 0, -8);                                // fin
  c.fillStyle = "#fff"; ell(c, 6, -1.2, 1.7, 1.7); c.fillStyle = "#1b1b1b"; ell(c, 6.4, -1.1, .9, .9);
  c.restore();
}
function drawFish() {
  if (fish.t < 0) return;
  const c = ctx, up = Math.min(1, fish.t / .6), down = fish.gone ? Math.max(0, 1 - (fish.t - fish.goneAt) / .6) : 1, a = Math.min(up, down);
  const p = (time * 1.6) % 1;   // ripples spreading from the fish
  c.save();
  c.strokeStyle = `rgba(255,255,255,${.5 * (1 - p) * a})`; c.lineWidth = 1.4; c.beginPath(); c.ellipse(fish.x, fish.y + 2, 10 + p * 16, 4 + p * 6, 0, 0, Math.PI * 2); c.stroke();
  if (season.night) { const g = c.createRadialGradient(fish.x, fish.y, 0, fish.x, fish.y, 26); g.addColorStop(0, `rgba(255,214,110,${.45 * a})`); g.addColorStop(1, "rgba(255,214,110,0)"); c.fillStyle = g; c.fillRect(fish.x - 26, fish.y - 26, 52, 52); }
  c.globalAlpha = a;
  const sp = !fish.gone && Math.sin(time * 9) > .96;   // a glint now and then
  drawFishShape(c, fish.x, fish.y - 2 * up, 1, fish.face, Math.sin(time * 10) * 2);
  if (sp) { c.fillStyle = "#fff"; ell(c, fish.x + 2, fish.y - 6, 1.6, 1.6); }
  c.restore();
}
// the pond can't be built on anyway, so while the fish is up a tap anywhere on the pond (or near the fish) catches it
function fishHit(x, y, pad = 0) {
  if (!fish || fish.gone || fish.t < 0) return false;
  return Math.hypot(x - fish.x, y - fish.y) < 26 + pad || ((x - 400) / (82 + pad)) ** 2 + ((y - 80) / (44 + pad)) ** 2 < 1;
}
function catchFish() {
  if (!fish || fish.gone || fish.t < 0) return;
  fish.gone = true; fish.goneAt = fish.t; sfx("clear"); unlock("wish");
  for (let i = 0; i < 16; i++) { const a = Math.random() * 6.28, sp = 30 + Math.random() * 50; S.fx.push({ x: fish.x, y: fish.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: .6, max: .6, col: i % 2 ? "rgba(255,214,110,.95)" : "rgba(200,235,250,.9)", r: 2.2, g: 90 }); }
  const ids = Object.keys(WISHES).sort(() => Math.random() - .5).slice(0, 3), was = paused;
  paused = true;
  openModal(card => {
    card.append(el("h2", "", "The golden fish grants a wish"), el("p", "", `Choose one. It lasts for the rest of this level and the next ${WISH_LEVELS}.`));
    const g = el("div", "heirlooms");
    ids.forEach(id => {
      const P = PERKS[id], R = RARITY[P.r], n = WISHES[id], b = el("button", `heirloom ${P.r}`); b.style.setProperty("--rc", R.col);
      b.append(heirloomImg(id, "hi"), el("span", "rr", "Wish"), el("span", "bn", P.name), el("span", "bd", P.desc(n)), el("span", "bo", perk(id) ? `On top of your ${perk(id)} heirloom${perk(id) === 1 ? "" : "s"}` : `For ${WISH_LEVELS + 1} levels`));
      b.addEventListener("click", () => {
        S.wish = { id, n, until: S.level + WISH_LEVELS }; sfx("up");
        toast(`Your wish is granted: ${P.name} for ${WISH_LEVELS + 1} levels.`); schedulePersist(); closeModal();
      });
      g.append(b);
    });
    const no = el("button", "", "Let it swim away");
    no.addEventListener("click", closeModal);
    card.append(g, el("div", "row")); card.lastChild.append(no);
  }, () => { paused = was; renderUpNext(); renderPanel(); updateHud(); });
}
document.addEventListener("keydown", ev => { if ((ev.key === "w" || ev.key === "W") && fish && !fish.gone && fish.t >= 0 && $("modal").hidden && !ev.target.closest("input, textarea, select")) { ev.preventDefault(); catchFish(); } });
