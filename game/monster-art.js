// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
function wings(c, x, y, span, flap, col) {
  c.fillStyle = col;
  c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - span * .6, y - span * .9 * flap, x - span, y - span * .2 * flap); c.quadraticCurveTo(x - span * .5, y + 2, x, y + 3); c.fill();
  c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + span * .6, y - span * .9 * flap, x + span, y - span * .2 * flap); c.quadraticCurveTo(x + span * .5, y + 2, x, y + 3); c.fill();
}
// a leathery wing with finger bones and a scalloped trailing edge; side is -1 (left) or 1 (right)
function webWing(c, x, y, side, span, flap, col, bone) {
  const sx = x + side * span * .38, sy = y - span * .62 * flap - 2, tx = x + side * span, ty = y - span * .12 * flap;
  const p2 = [x + side * span * .68, y + span * .08], p1 = [x + side * span * .36, y + span * .14];
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 1); c.quadraticCurveTo(x + side * span * .12, sy - 1, sx, sy); c.lineTo(tx, ty);
  c.quadraticCurveTo(x + side * span * .8, ty + 1, p2[0], p2[1]); c.quadraticCurveTo(x + side * span * .52, p2[1] - span * .1, p1[0], p1[1]);
  c.quadraticCurveTo(x + side * span * .18, p1[1] - span * .08, x, y + 3); c.closePath(); c.fill();
  c.strokeStyle = bone; c.lineWidth = 1; c.lineCap = "round"; c.beginPath();
  c.moveTo(x, y - 1); c.lineTo(sx, sy); c.lineTo(tx, ty); c.moveTo(sx, sy); c.lineTo(p2[0], p2[1]); c.moveTo(sx, sy); c.lineTo(p1[0], p1[1]); c.stroke();
}
function eyes(c, x, y, gap, r, col = "#fff3b0") { c.fillStyle = col; ell(c, x - gap, y, r, r); ell(c, x + gap, y, r, r); c.fillStyle = "#1b1b1b"; ell(c, x - gap + .5, y + .3, r * .5, r * .5); ell(c, x + gap + .5, y + .3, r * .5, r * .5); }
// seasonal outfits, drawn on top of each monster in its own coordinates (head centre hx,hy and size hr; neck at ny; torch hand tx,ty)
const SCARF = { leaves: ["#c0532a", "#f2c14e"], snow: ["#c0453c", "#f4f8fb"] };
function wear(c, e, a) {
  if (e.mount || !season) return;
  const kind = season.amb, t = e.t || 0, { hx, hy, hr } = a;
  // scarf: autumn and winter, round the neck with a tail flapping behind
  if (SCARF[kind] && a.ny != null) {
    const [c1, c2] = SCARF[kind], nx = a.nx || 0, flap = Math.sin(t * 10) * 1.5;
    if (a.vert) { c.fillStyle = c1; ell(c, nx, a.ny, 2.8, a.nw); c.fillStyle = c2; ell(c, nx, a.ny - a.nw * .45, 2.9, 1); ell(c, nx, a.ny + a.nw * .45, 2.9, 1); }
    else { c.fillStyle = c1; c.beginPath(); c.roundRect(nx - a.nw, a.ny - 1.8, a.nw * 2, 3.6, 1.8); c.fill(); c.fillStyle = c2; for (let i = -1; i <= 1; i++) c.fillRect(nx + i * a.nw * .55 - .8, a.ny - 1.8, 1.6, 3.6); }
    c.fillStyle = c1; c.beginPath(); c.moveTo(nx - (a.vert ? 1 : a.nw * .6), a.ny); c.lineTo(nx - (a.vert ? 9 : a.nw * .6 + 6), a.ny + 3 + flap); c.lineTo(nx - (a.vert ? 8 : a.nw * .6 + 5), a.ny + 6 + flap); c.lineTo(nx - (a.vert ? 0 : a.nw * .6 - 2), a.ny + 2); c.fill();
  }
  if (!a.nohat) {
    if (kind === "petals") {  // a flower tucked behind the ear
      const fx = hx - hr * .5, fy = hy - hr * .82;
      c.fillStyle = "#f5a3c7"; for (let i = 0; i < 5; i++) { const an = i * 1.2566; ell(c, fx + Math.cos(an) * 2.1, fy + Math.sin(an) * 2.1, 1.7, 1.7); }
      c.fillStyle = "#ffd84d"; ell(c, fx, fy, 1.3, 1.3);
    } else if (kind === "pollen") {  // straw sun hat
      c.fillStyle = "#c9a04a"; ell(c, hx, hy - hr * .78, hr * 1.1, hr * .26);
      c.fillStyle = "#e8c871"; c.beginPath(); c.arc(hx, hy - hr * .82, hr * .58, Math.PI, 0); c.fill();
      c.fillStyle = "#c0453c"; c.fillRect(hx - hr * .58, hy - hr * .98, hr * 1.16, Math.max(1.2, hr * .14));
    } else if (kind === "leaves") {  // a fallen leaf stuck on the head
      c.save(); c.translate(hx + hr * .2, hy - hr * .92); c.rotate(-.5 + Math.sin(t * 3) * .1);
      c.fillStyle = "#d4572a"; ell(c, 0, 0, hr * .4, hr * .2); c.strokeStyle = "#8e3a1c"; c.lineWidth = .8; c.beginPath(); c.moveTo(-hr * .45, 0); c.lineTo(hr * .35, 0); c.stroke(); c.restore();
    } else if (kind === "snow") {  // woolly bobble hat
      c.fillStyle = "#c0453c"; c.beginPath(); c.arc(hx, hy - hr * .62, hr * .72, Math.PI, 0); c.fill();
      c.fillStyle = "#f4f8fb"; c.beginPath(); c.roundRect(hx - hr * .8, hy - hr * .7, hr * 1.6, hr * .3, hr * .12); c.fill();
      ell(c, hx + Math.sin(t * 6) * .6, hy - hr * 1.38, hr * .22, hr * .22);
    }
  }
  // night: a burning torch with a warm glow
  if (season.night && a.tx != null) {
    const { tx, ty } = a, fy = ty - 13, fl = Math.sin(t * 23) * .8 + Math.sin(t * 37) * .5;
    const g = c.createRadialGradient(tx, fy, 1, tx, fy, 26);
    g.addColorStop(0, "rgba(255,190,90,.35)"); g.addColorStop(1, "rgba(255,190,90,0)");
    c.fillStyle = g; ell(c, tx, fy, 26, 26);
    c.strokeStyle = "#6b4a2b"; c.lineWidth = 2.2; c.lineCap = "round"; c.beginPath(); c.moveTo(tx + 1, ty); c.lineTo(tx, fy + 2); c.stroke();
    c.fillStyle = "#e2683e"; c.beginPath(); c.moveTo(tx - 3, fy + 2); c.quadraticCurveTo(tx - 3.5, fy - 3, tx + fl, fy - 7.5); c.quadraticCurveTo(tx + 3.5, fy - 3, tx + 3, fy + 2); c.fill();
    c.fillStyle = "#ffd25e"; ell(c, tx + fl * .4, fy - 1, 1.7, 2.8);
  }
}
function enemyBody(c, e) {
  const r = e.r, t = e.t;
  const flap = .4 + (Math.sin(t * 14) + 1) * .5;
  switch (e.k) {
    case "goblin": {
      // a skinny grinning goblin with a big nose and a rusty dagger
      const step = Math.sin(t * 16) * 1.8;
      if (!e.ride) { c.fillStyle = "#4f7a2a"; ell(c, -3 + step, r * .9, 3, 1.8); ell(c, 3 - step, r * .9, 3, 1.8); }
      c.fillStyle = "#5f8c33"; tri(c, -r + 2, -2, -r - 7, -9, -r + 4, -7); tri(c, r - 2, -2, r + 7, -9, r - 4, -7);
      c.fillStyle = "#e397b2"; tri(c, -r + 2, -3, -r - 4, -7.5, -r + 3.5, -6);
      c.fillStyle = e.col; ell(c, 0, 0, r, r);
      c.fillStyle = "#9cc865"; ell(c, -2.5, -r * .5, r * .45, r * .25);
      c.fillStyle = "#6b4a2b"; c.fillRect(-r + 2, 3, 2 * r - 4, 4);
      c.fillStyle = "#c9a46a"; c.fillRect(-1.5, 3.4, 3, 3.2);
      eyes(c, 2, -2.5, 3.5, 2.2);
      if ((e.v ?? 1) < .35) { c.strokeStyle = "#e9b949"; c.lineWidth = 1; c.beginPath(); c.arc(r + .5, -2, 1.5, 0, Math.PI * 2); c.stroke(); }
      if ((e.v2 ?? 1) < .3) { c.fillStyle = "#2a2018"; ell(c, 5.5, -2.5, 2.6, 2.4); c.strokeStyle = "#2a2018"; c.lineWidth = .8; c.beginPath(); c.moveTo(3, -4.5); c.lineTo(-r * .6, -r * .7); c.moveTo(7.5, -1.5); c.lineTo(r * .95, -1); c.stroke(); }
      c.fillStyle = "#6a9a3a"; ell(c, r * .55, .5, 2.6, 2);
      c.fillStyle = "#2e3d1a"; c.fillRect(0, 1.6, 5, 1.1);
      c.fillStyle = "#fff"; c.fillRect(1.6, 1.6, 1.4, 1.5);
      c.strokeStyle = "#9a8f80"; c.lineWidth = 1.8; c.lineCap = "round"; c.beginPath(); c.moveTo(r * .8, 3); c.lineTo(r + 5, -3); c.stroke();
      c.fillStyle = "#6b4a2b"; ell(c, r * .75, 3.5, 1.6, 1.6);
      wear(c, e, { hx: 1, hy: 0, hr: r, ny: r * .5, nw: r * .95, tx: -r * .85, ty: 3 });
      break; }
    case "wolf": {
      // a scruffy trotting wolf: wagging bushy tail, legs that move, tongue out, one floppy ear
      const wag = Math.sin(t * 12) * .35, trot = Math.sin(t * 16), hx = r * 1.05, hy = -4;
      c.save(); c.translate(-r * 1.05, -1); c.rotate(-.5 + wag);
      c.fillStyle = e.col; ell(c, -6, 0, 7, 3.8); c.fillStyle = "#e4e6e8"; ell(c, -11, 0, 2.8, 2.3); c.restore();
      c.strokeStyle = "#6f757b"; c.lineWidth = 3; c.lineCap = "round"; c.beginPath();
      c.moveTo(-r * .6, 4); c.lineTo(-r * .6 + trot * 2.5, 9.5); c.moveTo(r * .55, 4); c.lineTo(r * .55 - trot * 2.5, 9.5); c.stroke();
      c.fillStyle = e.col; ell(c, 0, 0, r * 1.2, r * .72);
      c.fillStyle = "#c9cdd1"; ell(c, 1, 3.5, r * .8, r * .3);
      c.fillStyle = "#80868c"; ell(c, -2, -4.6, r * .75, 2.2);
      c.strokeStyle = "#8a9096"; c.lineWidth = 3.2; c.beginPath();
      c.moveTo(-r * .4, 5); c.lineTo(-r * .4 - trot * 2.5, 10); c.moveTo(r * .75, 4); c.lineTo(r * .75 + trot * 2.5, 10); c.stroke();
      c.fillStyle = "#6f757b"; tri(c, hx - 5, hy - 3, hx - 4, hy - 12, hx + .5, hy - 5);
      c.fillStyle = e.col; ell(c, hx, hy, 6.5, 6);
      c.fillStyle = "#e7708a"; ell(c, hx + 6, hy + 5, 1.7, 2.6);
      c.fillStyle = "#c9cdd1"; ell(c, hx + 5.5, hy + 1.5, 5, 3.2);
      c.fillStyle = "#1b1b1b"; ell(c, hx + 10, hy + .4, 1.7, 1.4);
      if ((e.v ?? 1) < .4) { c.fillStyle = "#6f757b"; ell(c, hx + 1.6, hy - 1.8, 3.7, 3.5); }
      c.fillStyle = "#fff3b0"; ell(c, hx + 1.5, hy - 1.8, 2.4, 2.4);
      c.fillStyle = "#1b1b1b"; ell(c, hx + 2.3, hy - 1.4, 1.2, 1.2);
      c.fillStyle = "#fff"; ell(c, hx + 2.6, hy - 2.1, .45, .45);
      c.fillStyle = "#8a9096"; tri(c, hx - 1.5, hy - 4, hx + 5, hy - 9, hx + 3, hy - 2.5);
      if ((e.v2 ?? 1) < .3) { c.fillStyle = "#f1f1f1"; ell(c, -r * .4 - trot * 2.5, 10, 1.9, 1.4); ell(c, r * .75 + trot * 2.5, 10, 1.9, 1.4); }
      wear(c, e, { hx, hy, hr: 6.5, nx: r * .7, ny: -1, nw: 5, vert: true });
      break; }
    case "orc": {
      // a chunky orc in a studded leather cap, underbite tusks, hefting a little axe
      const step = Math.sin(t * 14) * 2;
      if (!e.ride) { c.fillStyle = "#4e5a28"; ell(c, -4 + step, r * .88, 4, 2.4); ell(c, 4 - step, r * .88, 4, 2.4); }
      c.save(); c.translate(-r * .7, 1); c.rotate(-.5 + Math.sin(t * 7) * .1);
      c.fillStyle = "#7a5532"; c.fillRect(-1.3, -r * 1.05, 2.6, r * 1.05);
      c.fillStyle = "#a9b2ba"; c.beginPath(); c.moveTo(0, -r * 1.05); c.quadraticCurveTo(-7, -r * .95, -6, -r * .45); c.lineTo(0, -r * .62); c.fill();
      c.restore();
      c.fillStyle = "#5c6a30"; tri(c, -r + 1, -3, -r - 5, -6, -r + 3, -8);
      c.fillStyle = e.col; ell(c, 0, 0, r, r);
      c.fillStyle = "#808f48"; ell(c, 2, 5, r * .55, r * .35);
      c.fillStyle = "#5a4128"; c.beginPath(); c.arc(0, -1, r, Math.PI * 1.08, Math.PI * 1.92); c.closePath(); c.fill();
      c.fillStyle = "#c9ced4"; ell(c, -5, -r * .55, 1.2, 1.2); ell(c, 0, -r * .7, 1.2, 1.2); ell(c, 5, -r * .55, 1.2, 1.2);
      c.fillStyle = "#4e5a28"; ell(c, 3, -2.8, 7, 1.8);
      eyes(c, 2.5, -.5, 4, 2.2, "#ffcf6b");
      c.fillStyle = "#3b4520"; ell(c, 3, 5.5, 5, 1.6);
      c.fillStyle = "#fff"; tri(c, -1.5, 6, -.5, 1.8, .6, 6); if ((e.v ?? 1) < .35) tri(c, 5.6, 6, 6.6, 4.3, 7.7, 6); else tri(c, 5.6, 6, 6.6, 1.8, 7.7, 6);
      if ((e.v2 ?? 1) < .35) { c.strokeStyle = "#c98a78"; c.lineWidth = 1; c.beginPath(); c.moveTo(-3.5, -4); c.lineTo(.5, 2); c.moveTo(-3, -1.5); c.lineTo(-.6, -2.6); c.moveTo(-1.6, .5); c.lineTo(.6, -.6); c.stroke(); }
      c.fillStyle = e.col; ell(c, r * .82, 3, 3.4, 4.6);
      wear(c, e, { hx: 1, hy: 0, hr: r, ny: r * .55, nw: r * .95, tx: -r * .8, ty: 4 });
      break; }
    case "bat": {
      // a fuzzy round bat: scalloped wings, huge ears, mismatched eyes, two little fangs and dangling feet
      webWing(c, -1, -1, -1, r * 2.5, flap, "#3f3258", "#6a5590"); webWing(c, 1, -1, 1, r * 2.5, flap, "#3f3258", "#6a5590");
      c.fillStyle = "#3f3258"; ell(c, -2, r * .95, 1.2, 1.8); ell(c, 2, r * .95, 1.2, 1.8);
      c.fillStyle = e.col; tri(c, -r * .8, -r * .3, -r * .5, -r * 1.75, r * .05, -r * .6); tri(c, r * .8, -r * .3, r * .5, -r * 1.75, -r * .05, -r * .6);
      c.fillStyle = "#e397b2"; tri(c, -r * .6, -r * .5, -r * .48, -r * 1.35, -r * .15, -r * .65); tri(c, r * .6, -r * .5, r * .48, -r * 1.35, r * .15, -r * .65);
      c.fillStyle = e.col; ell(c, 0, 0, r, r); for (let i = 0; i < 5; i++) { const an = 1.9 + i * .55; ell(c, Math.cos(an) * r * .95, Math.sin(an) * r * .9, 1.6, 1.6); }
      c.fillStyle = "#8a76a8"; ell(c, 0, r * .4, r * .55, r * .45);
      c.fillStyle = "#fff3b0"; ell(c, -1.6, -1.2, 2.3, 2.3); ell(c, 2.6, -.8, 1.6, 1.6);
      c.fillStyle = "#1b1b1b"; ell(c, -1.1, -.9, 1.1, 1.1); ell(c, 2.9, -.6, .8, .8);
      c.fillStyle = "#ff9f8a"; ell(c, -1.3, -1.5, .4, .4);
      c.fillStyle = "#fff"; if ((e.v ?? 1) < .4) tri(c, .1, 1.8, 1.3, 1.8, .7, 4); else { tri(c, -.8, 1.8, .2, 1.8, -.3, 3.6); tri(c, 1, 1.8, 2, 1.8, 1.5, 3.6); }
      if ((e.v2 ?? 1) < .3) { c.fillStyle = e.col; tri(c, -1.5, -r * .9, -.3, -r * 1.45, .6, -r * .9); tri(c, .2, -r * .9, 1.5, -r * 1.35, 2.2, -r * .9); }
      wear(c, e, { hx: 0, hy: 0, hr: r * 1.1 }); break; }
    case "knight": {
      // a wobbly skeleton in a too-big breastplate: kite shield behind, skull head under a dented helmet, little sword
      const hy = -r * .62, wob = Math.sin(t * 9) * .08;
      c.fillStyle = "#8f3a32"; c.beginPath(); c.moveTo(-r - 3, -4); c.lineTo(-r * .3, -5); c.lineTo(-r * .45, 6); c.lineTo(-r * .85, 11); c.lineTo(-r - 4, 5); c.closePath(); c.fill();
      c.strokeStyle = "#6b737b"; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = e.col; ell(c, -r * .7, 0, 1.8, 1.8);
      c.fillStyle = "#7d868f"; ell(c, 0, 2, r, r * .9);
      c.fillStyle = "#a9b2ba"; ell(c, -1.5, 0, r * .72, r * .65);
      c.fillStyle = "#cfd6dc"; ell(c, -3.5, -2.5, 2.5, 1.6);
      c.fillStyle = "#5b3d22"; c.fillRect(-r + 1.5, r * .45, 2 * r - 3, 2.5);
      c.fillStyle = "#e9b949"; c.fillRect(-1.5, r * .45 - .2, 3, 3);
      c.save(); c.translate(2, hy); c.rotate(wob);
      c.fillStyle = e.col; ell(c, 0, 0, r * .74, r * .66);
      c.fillStyle = e.col; c.fillRect(-r * .38, r * .38, r * .76, 3.5);
      c.strokeStyle = "#8a8474"; c.lineWidth = .9; c.beginPath();
      for (let i = -1; i <= 2; i++) { c.moveTo(i * 2.3 - 1, r * .38); c.lineTo(i * 2.3 - 1, r * .38 + 3.5); } c.stroke();
      c.fillStyle = "#2a2430"; ell(c, -1.5, -.5, 2.7, 3.1); ell(c, 4.2, 0, 2.1, 2.5);
      c.fillStyle = "#7ef0ff"; ell(c, -.8, -1.2, 1, 1); ell(c, 3.6, .6, .9, .9);
      c.fillStyle = "#2a2430"; tri(c, 1.4, 2.6, 2.8, 2.6, 2.1, 4);
      if ((e.v2 ?? 1) < .35) { c.strokeStyle = "#5a5446"; c.lineWidth = .7; c.beginPath(); c.moveTo(-5.5, -.5); c.lineTo(-4.3, 1.4); c.lineTo(-5.4, 2.6); c.lineTo(-4.6, 4); c.stroke(); }
      c.fillStyle = "#8d949b"; c.beginPath(); c.arc(0, -.5, r * .8, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill();
      c.fillStyle = "#6b737b"; c.fillRect(-r * .82, -2.2, r * 1.64, 2);
      c.fillStyle = "#b8bfc6"; ell(c, -3, -r * .55, 2.2, 1.2);
      c.strokeStyle = ["#c0453c", "#3d6fb8", "#e9b949"][Math.floor((e.v ?? 0) * 3) % 3]; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(0, -r * .78); c.quadraticCurveTo(-4, -r * 1.35, -r * .95, -r * .95); c.stroke();
      c.restore();
      c.strokeStyle = "#5b3d22"; c.lineWidth = 2.5; c.lineCap = "round"; c.beginPath(); c.moveTo(r * .55, 5); c.lineTo(r * .8, 2); c.stroke();
      c.strokeStyle = "#d9dfe4"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(r * .8, 2); c.lineTo(r + 7, -8); c.stroke();
      c.strokeStyle = "#e9b949"; c.lineWidth = 2; c.beginPath(); c.moveTo(r * .55, -.5); c.lineTo(r * 1.05, 4.5); c.stroke();
      c.fillStyle = e.col; ell(c, r * .6, 4.5, 2, 2);
      wear(c, e, { hx: 2, hy, hr: r * .74, nohat: true, ny: -r * .05, nw: r * .7, tx: -r * .35, ty: 4 });
      break; }
    case "wolfrider": case "orcrider": {
      // a goblin on a grey wolf, or an orc on a big dark dire wolf: same toughness as on foot, much faster
      const big = e.k === "orcrider", bounce = Math.abs(Math.sin(t * 16)) * 1.2;
      enemyBody(c, { k: "wolf", r: big ? 12 : 10.5, col: big ? "#6e6a66" : "#9aa0a6", t, mount: true, v: e.v2, v2: e.v });
      c.fillStyle = big ? "#7a2f2a" : "#8f6f3a"; ell(c, -2, -6, big ? 8 : 7, 3);
      c.save(); c.translate(-2, (big ? -14 : -11) - bounce); c.scale(big ? .8 : .78, big ? .8 : .78);
      enemyBody(c, { k: big ? "orc" : "goblin", r: big ? 12 : 9, col: big ? "#6b7a3a" : "#7fb04a", t, ride: true, v: e.v, v2: e.v2 });
      c.restore();
      break; }
    case "troll": {
      // a lumpy, mossy troll with an underbite and tusks, dragging a knobbly club
      const sw = Math.sin(t * 6) * .12;
      c.save(); c.translate(-r * .55, 2); c.rotate(-.9 + sw);
      c.fillStyle = "#7a5532"; c.fillRect(-1.8, -r * 1.2, 3.6, r * 1.2);
      c.fillStyle = "#8c6640"; ell(c, 0, -r * 1.25, 4.8, 6.2);
      c.fillStyle = "#5e4026"; ell(c, -1.6, -r * 1.35, 1.1, 1.1); ell(c, 1.7, -r * 1.12, 1, 1);
      c.restore();
      c.fillStyle = "#56707f"; ell(c, -6, r * .85, 5.5, 3.2); ell(c, 6, r * .85, 5.5, 3.2);
      c.fillStyle = e.col; ell(c, 0, 0, r, r * .95);
      c.fillStyle = "#86a1b0"; ell(c, 1, -r * .55, r * .55, r * .22);
      c.fillStyle = "#8aa3b0"; ell(c, 2, 6, r * .58, r * .4);
      c.fillStyle = "#6b4a2b"; c.fillRect(-r * .78, r * .52, r * 1.56, 3.2); tri(c, -3, r * .52 + 3, 5, r * .52 + 3, 1, r * .52 + 8);
      c.fillStyle = "#6f9a4a"; ell(c, -4, -r * .88, 4.2, 2.6); ell(c, 1.5, -r * .97, 3.6, 2.8); ell(c, -8, -r * .7, 2.6, 2);
      if ((e.v ?? 1) < .4) { c.fillStyle = "#f1e6c8"; c.fillRect(-7.2, -r * 1.05, 2, 3.5); c.fillStyle = "#c0453c"; c.beginPath(); c.arc(-6.2, -r * 1.05, 3.4, Math.PI, 0); c.fill(); c.fillStyle = "#fff"; ell(c, -7.4, -r * 1.05 - 1.6, .7, .7); ell(c, -5, -r * 1.05 - 1.2, .6, .6); }
      c.fillStyle = "#4e6573"; ell(c, 3.5, -8.2, 7.8, 2.2);
      eyes(c, 3.5, -5.6, 3.6, 1.9);
      c.fillStyle = "#2e3d45"; ell(c, 4, 4.5, 5.5, 2.4);
      c.fillStyle = "#f1e6c8"; tri(c, .2, 5.6, 1.3, 1.6, 2.5, 5.6); tri(c, 5.6, 5.6, 6.8, 2, 8, 5.6);
      c.fillStyle = "#5a7381"; ell(c, r * .52, -1, 4.6, 4);
      if ((e.v2 ?? 1) < .35) { c.strokeStyle = "#e9b949"; c.lineWidth = 1.2; c.beginPath(); c.arc(r * .55, 3.4, 1.8, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = "#7d98a6"; ell(c, r * .52 + 1, -2.4, 1.6, 1.2);
      c.fillStyle = e.col; ell(c, r * .8, 3, 3.6, 5);
      wear(c, e, { hx: 2, hy: -1, hr: r * .85, ny: r * .3, nw: r * .9, tx: r * .8, ty: 3 });
      break; }
    case "wyvern": {
      // a gangly young wyvern: two-tone bony wings, belly plates, spade-tipped tail, horns, goofy eye, puffs of smoke
      const sway = Math.sin(t * 5) * 2;
      webWing(c, -2, -5, -1, r * 2.3, Math.min(1.4, flap * 1.1), "#2c6d5c", "#5fae95");
      c.strokeStyle = e.col; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(-r * .8, 1); c.quadraticCurveTo(-r * 1.5, 4 + sway, -r * 2, sway); c.stroke();
      c.fillStyle = "#2c6d5c"; tri(c, -r * 2.3, sway, -r * 1.85, sway - 4, -r * 1.85, sway + 4);
      c.fillStyle = "#2f7a66"; ell(c, -2, r * .55, 2, 2.6); ell(c, 4, r * .55, 2, 2.6);
      c.fillStyle = e.col; ell(c, 0, 0, r, r * .68);
      c.fillStyle = "#a8dcc4"; ell(c, 1, r * .32, r * .7, r * .3);
      c.strokeStyle = "#7fbfa6"; c.lineWidth = .8; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(1 + i * 3, r * .1); c.lineTo(1 + i * 3, r * .55); } c.stroke();
      c.fillStyle = "#2c6d5c"; for (let i = -2; i <= 1; i++) tri(c, i * 4 - 2, -r * .6, i * 4 + 2, -r * .6, i * 4, -r * .6 - 3.5);
      if ((e.v ?? 1) < .4) { c.fillStyle = "rgba(255,255,255,.2)"; ell(c, -5, -2, 1.8, 1.4); ell(c, -1, -4, 1.4, 1.1); ell(c, 3, -1.5, 1.6, 1.2); ell(c, -7.5, 1.5, 1.2, 1); }
      c.fillStyle = e.col; ell(c, r * .7, -4, 4, 4.5);
      ell(c, r * 1.05, -7, 6.5, 5.5); ell(c, r * 1.5, -5.5, 4.5, 3.2);
      c.fillStyle = "#f1e6c8"; tri(c, r * .78, -11, r * .62, -18, r * .95, -12);
      if ((e.v2 ?? 1) < .35) tri(c, r * 1.02, -12, r * 1.04, -15, r * 1.18, -12); else tri(c, r * 1.02, -12, r * 1, -18.5, r * 1.18, -12);
      c.fillStyle = "#fff3b0"; ell(c, r * 1.12, -8.5, 2.6, 2.6); c.fillStyle = "#1b1b1b"; ell(c, r * 1.22, -8.2, 1.3, 1.3);
      c.fillStyle = "#1f4f42"; ell(c, r * 1.78, -6.2, .7, .5);
      c.fillStyle = "#fff"; tri(c, r * 1.3, -3.2, r * 1.38, -.8, r * 1.46, -3.2);
      if (Math.sin(t * 2.5) > .7) { c.fillStyle = "rgba(220,220,220,.7)"; ell(c, r * 1.95, -9, 2, 2); ell(c, r * 2.15, -12, 1.4, 1.4); }
      webWing(c, 3, -4, -1, r * 2.1, Math.max(.25, flap * .85), "#3a8a73", "#7fc9ae");
      wear(c, e, { hx: r * 1.05, hy: -7, hr: 6 }); break; }
    case "jasmine": {
      // Jasmine: a witch riding side-saddle on a broomstick, cape streaming, hat tip flopping back,
      // wand raised and one perfect tear on her cheek (none of this is her fault, apparently)
      c.save(); c.scale(r / 11, r / 11);
      const wave = Math.sin(t * 7) * 1.6, tw = Math.sin(t * 9) > 0;
      { const r = 11;
      c.fillStyle = "#c9a35a"; c.beginPath(); c.moveTo(-r * 1.35, 4); c.lineTo(-r * 2.3, -1 + wave * .4); c.lineTo(-r * 2.4, 5); c.lineTo(-r * 2.25, 11 - wave * .4); c.closePath(); c.fill();
      c.strokeStyle = "#a07f3c"; c.lineWidth = .8; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(-r * 1.4, 4.5); c.lineTo(-r * 2.3, 5 + i * 2.4); } c.stroke();
      c.strokeStyle = "#7a5532"; c.lineWidth = 2.2; c.lineCap = "round"; c.beginPath(); c.moveTo(-r * 1.4, 4.5); c.lineTo(r * 1.25, 1); c.stroke();
      c.fillStyle = "#8f3d4a"; c.fillRect(-r * 1.45, 2.6, 2.2, 3.8);
      c.fillStyle = "#2d2342"; c.beginPath(); c.moveTo(-1, -7); c.quadraticCurveTo(-r * 1.2, -6 + wave, -r * 1.75, -1 + wave); c.quadraticCurveTo(-r * 1.1, 2, -2, 4); c.closePath(); c.fill();
      c.fillStyle = "#5a2340"; ell(c, -.5, -7.5, 4.6, 4.8); ell(c, -4, -4.5 + wave * .3, 3, 4.5);
      c.fillStyle = e.col; ell(c, 1, 0, 6, 6.5);
      c.fillStyle = "#e9e2f2"; c.fillRect(2, 4.5, 4.5, 2.6); c.fillStyle = "#8f3d4a"; c.fillRect(3.4, 4.5, 1.3, 2.6);
      c.fillStyle = "#221a2e"; ell(c, 7.2, 6.4, 2.6, 1.6); tri(c, 8.6, 5.4, 11, 4.2, 9.2, 7);
      c.fillStyle = "#f0d2bd"; ell(c, 3.4, -9, 4.2, 4.4); tri(c, 7, -9.4, 8.6, -8, 7, -7.4);
      c.fillStyle = "#fff"; ell(c, 5, -9.6, 1.4, 1.5); c.fillStyle = "#2a2433"; ell(c, 5.3, -9.4, .8, .9);
      c.strokeStyle = "#5a2340"; c.lineWidth = .9; c.beginPath(); c.moveTo(3.6, -11.3); c.lineTo(6.2, -12.2); c.stroke();
      c.fillStyle = "#aee3f5"; c.beginPath(); c.moveTo(5.3, -8.2); c.quadraticCurveTo(6.2, -6.4, 5.3, -6); c.quadraticCurveTo(4.4, -6.4, 5.3, -8.2); c.fill();
      c.strokeStyle = "#9c3c4f"; c.lineWidth = .9; c.beginPath(); c.arc(6.4, -5.6, 1.3, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      const flop = Math.sin(t * 4) * 1.2;
      c.fillStyle = "#231b33"; c.beginPath(); c.moveTo(-1.6, -12.6); c.lineTo(1, -19.5); c.quadraticCurveTo(-1.5, -23.5, -5.5, -22 + flop); c.quadraticCurveTo(-1, -21.5, 3.6, -19.3); c.lineTo(6.4, -12.6); c.closePath(); c.fill();
      ell(c, 2.6, -12.6, 7.4, 1.7);
      c.fillStyle = "#8f3d4a"; c.fillRect(-1.1, -14.7, 7, 1.7); c.fillStyle = "#e9b949"; c.fillRect(2, -14.9, 1.8, 2.1);
      c.strokeStyle = e.col; c.lineWidth = 3; c.beginPath(); c.moveTo(3, -2); c.lineTo(8.5, -4.5); c.stroke();
      c.fillStyle = "#f0d2bd"; ell(c, 9.2, -4.8, 1.6, 1.6);
      c.strokeStyle = "#3b2a1e"; c.lineWidth = 1.1; c.beginPath(); c.moveTo(9, -4.6); c.lineTo(14, -8.6); c.stroke();
      c.fillStyle = tw ? "#ffe08a" : "#c9a8ff"; star(c, 14.6, -9.1, tw ? 2.6 : 2);
      }
      c.restore(); break; }
    case "trollking": {
      // the oldest troll: a bigger, greyer troll with a lichen beard, a tattered ermine-trimmed cloak,
      // a stone maul on his shoulder and a stolen crown, dented and a size too small. Drawn at troll scale, then grown.
      const k = r / 15, step = Math.sin(t * 5), sw = Math.sin(t * 5) * .06;
      c.save(); c.scale(k, k);
      c.fillStyle = "#7a2a26"; c.beginPath(); c.moveTo(-3, -12); c.quadraticCurveTo(-17, -9, -20, 4);
      c.lineTo(-17.5, 12 + step); c.lineTo(-14, 9.5); c.lineTo(-11, 13.5 - step); c.lineTo(-7, 10); c.lineTo(-3, 6); c.closePath(); c.fill();
      c.fillStyle = "#9b3a33"; c.beginPath(); c.moveTo(-3, -12); c.quadraticCurveTo(-13, -8, -15, 3); c.lineTo(-9, 1); c.quadraticCurveTo(-8, -7, -3, -12); c.fill();
      c.fillStyle = "#f1e6c8"; c.beginPath(); c.moveTo(-1, -14.5); c.quadraticCurveTo(-13, -12, -17, -4); c.lineTo(-12, -3); c.quadraticCurveTo(-9, -9, -1, -10); c.closePath(); c.fill();
      c.fillStyle = "#1b1b1b"; ell(c, -13.4, -6.6, .5, .8); ell(c, -10, -10.2, .5, .8); ell(c, -5.6, -12, .5, .8);
      c.save(); c.translate(-8, -1); c.rotate(-.75 + sw);
      c.fillStyle = "#6b4a2b"; c.fillRect(-1.8, -20, 3.6, 22);
      c.fillStyle = "#8d949b"; c.fillRect(-6.5, -27, 13, 8.5);
      c.fillStyle = "#a9b2ba"; c.fillRect(-6.5, -27, 13, 2.4);
      c.fillStyle = "#6b737b"; c.fillRect(-6.5, -20.4, 13, 1.9); c.fillRect(-.8, -26, 1.6, 6.5);
      c.restore();
      c.fillStyle = "#3f5563"; ell(c, -6 + step * 1.5, 13.5, 6, 3.4); ell(c, 6 - step * 1.5, 13.5, 6, 3.4);
      c.fillStyle = e.col; ell(c, 0, 0, 15, 14.5);
      c.fillStyle = "#6f8a99"; ell(c, 1, -8.5, 8.5, 3.2);
      c.fillStyle = "#7d98a6"; ell(c, 1.5, 6.5, 9, 6);
      c.strokeStyle = "#3f5563"; c.lineWidth = .9; c.beginPath(); c.moveTo(-9, -2); c.lineTo(-6, 1); c.moveTo(-10, 1.5); c.lineTo(-7.5, 4); c.stroke();
      c.fillStyle = "#4a3020"; c.fillRect(-12.2, 8.6, 24.4, 3.4);
      c.fillStyle = "#e9b949"; c.fillRect(-2.6, 7.9, 5.2, 4.8); c.fillStyle = "#56707f"; c.fillRect(-1.1, 9.4, 2.2, 1.8);
      c.fillStyle = "#6f9a4a"; ell(c, -9, -6, 3, 1.9); ell(c, 9.5, -7.5, 2.6, 1.7);
      c.fillStyle = "#3f5563"; ell(c, 3.8, -8.4, 8.6, 2.4);
      eyes(c, 3.8, -5.8, 3.8, 2, "#ffcf6b");
      c.strokeStyle = "#9db4c0"; c.lineWidth = .9; c.beginPath(); c.moveTo(-2, -9.5); c.lineTo(1.4, -2.6); c.stroke();
      c.fillStyle = "#2e3d45"; ell(c, 4.2, 4, 6, 2.4);
      c.fillStyle = "#a9bcae"; c.beginPath(); c.moveTo(-3, 4.2); c.quadraticCurveTo(4.5, 8.4, 12, 4.2);
      c.lineTo(11, 10.5); c.lineTo(8.6, 9); c.lineTo(6.4, 15.2); c.lineTo(4, 10); c.lineTo(1.2, 13); c.lineTo(-.6, 9.4); c.lineTo(-2.6, 10.6); c.closePath(); c.fill();
      c.fillStyle = "#86998c"; ell(c, 6.2, 9.6, 1.3, 3); ell(c, 1.6, 9, 1, 2);
      c.fillStyle = "#f1e6c8"; tri(c, -.2, 5.4, 1.2, .2, 2.6, 5.4); tri(c, 6, 5.4, 7.6, .6, 9, 5.4);
      c.fillStyle = "#4a6170"; ell(c, 11.6, -1.2, 4.6, 4);
      c.strokeStyle = "#e9b949"; c.lineWidth = 1.2; c.beginPath(); c.arc(11.8, 3, 1.9, 0, Math.PI * 2); c.stroke();
      c.fillStyle = e.col; ell(c, 13.2, 4, 4.2, 5.2);
      c.save(); c.translate(1.5, -14.6); c.rotate(-.16);
      c.fillStyle = "#e9b949"; c.beginPath(); c.moveTo(-7.5, 2.4); c.lineTo(-7.5, -5.5); c.lineTo(-4.5, -1.6); c.lineTo(-1.6, -7); c.lineTo(1, -1.8);
      c.lineTo(5.6, -5.2); c.lineTo(5, -1); c.lineTo(7.5, -5.8); c.lineTo(7.5, 2.4); c.closePath(); c.fill();
      c.fillStyle = "#b98a22"; c.fillRect(-7.5, .7, 15, 1.7); tri(c, 1, -1.8, 3.4, -1.2, 2.6, .7);
      c.fillStyle = "#fff3b0"; ell(c, -5.4, -.6, .8, .5); ell(c, -1.6, -5.2, .5, .7);
      c.fillStyle = "#c0453c"; ell(c, -1.6, -.4, 1.5, 1.5); c.fillStyle = "#3d6fb8"; ell(c, -5.2, .8, .9, .9); ell(c, 4.6, .8, .9, .9);
      c.restore();
      c.restore(); break; }
    case "bigdragon": {
      // an ancient red dragon: slow heavy wingbeats, torn and patched wings, a spined back, belly plates, old scars,
      // long swept-back horns, chin barbels and a temper that comes out as fire. Drawn at r = 26, then sized.
      const k = r / 26, beat = .45 + (Math.sin(t * 6) + 1) * .45, sway = Math.sin(t * 3) * 3, roar = Math.sin(t * 3) > .6;
      const col = e.col, dark = "#7e2a1e", deep = "#5e1d16", belly = "#e7a35a", horn = "#f1e6c8";
      c.save(); c.scale(k, k);
      webWing(c, -2, -9, -1, 58, Math.min(1.45, beat * 1.1), deep, "#c26a45");
      c.fillStyle = "#141d19"; ell(c, -38, -9 - 46 * .12 * beat, 2.2, 1.6);
      c.strokeStyle = col; c.lineCap = "round"; c.lineWidth = 9; c.beginPath(); c.moveTo(-18, 3); c.quadraticCurveTo(-36, 12 + sway, -48, 2 + sway); c.stroke();
      c.lineWidth = 5; c.beginPath(); c.moveTo(-46, 3 + sway); c.quadraticCurveTo(-54, -2 + sway, -58, -6 + sway); c.stroke();
      c.fillStyle = dark; tri(c, -64, -10 + sway, -55, -11 + sway, -57, -1 + sway); tri(c, -64, -10 + sway, -60, -2 + sway, -55, -4 + sway);
      for (let i = 0; i < 4; i++) { const f = i / 3, x = -24 - f * 26, y = 4 + Math.sin(f * Math.PI) * 6 + sway * f - 5; tri(c, x - 3, y + 1, x + 3, y + 1, x - 1, y - 5 + f * 2); }
      c.fillStyle = dark; ell(c, -10, 12, 6.5, 4.5); c.fillStyle = horn; tri(c, -14, 15, -12, 18.5, -10.5, 15); tri(c, -10, 15.5, -8, 19, -6.5, 15.5);
      c.fillStyle = col; ell(c, 0, 0, 26, 15);
      c.fillStyle = "#cf5a3c"; ell(c, -2, -7, 18, 5);
      c.fillStyle = belly; ell(c, 3, 7, 18, 6.5);
      c.strokeStyle = "#c9803f"; c.lineWidth = 1; c.beginPath(); for (let i = -3; i <= 3; i++) { c.moveTo(3 + i * 4.6, 2); c.lineTo(3 + i * 4.6, 12.5); } c.stroke();
      c.fillStyle = dark; for (let i = 0; i < 6; i++) { const x = -18 + i * 6, y = -14 + Math.abs(i - 2.5) * .9; tri(c, x - 3, y + 1.5, x + 3, y + 1.5, x - 1, y - (i === 3 ? 2.5 : 6)); }
      c.strokeStyle = "#e48a70"; c.lineWidth = 1; c.beginPath(); c.moveTo(-10, -5); c.lineTo(-4, 1); c.moveTo(-7, -6); c.lineTo(-2, -1.5); c.moveTo(8, -6); c.lineTo(11, -1); c.stroke();
      c.fillStyle = col; ell(c, 14, 10, 4.5, 4); c.fillStyle = horn; tri(c, 12, 12.5, 13.5, 16.5, 15, 12.5); tri(c, 15.5, 12.5, 17.5, 16, 18.5, 12);
      c.strokeStyle = col; c.lineWidth = 12; c.beginPath(); c.moveTo(14, -3); c.quadraticCurveTo(24, -6, 29, -16); c.stroke();
      c.strokeStyle = belly; c.lineWidth = 4; c.beginPath(); c.moveTo(17, 2); c.quadraticCurveTo(28, -2, 33, -12); c.stroke();
      c.save(); c.translate(34, -21);
      c.fillStyle = deep; tri(c, -6, -2, -16, -9, -8, 3); tri(c, -5, -5, -14, -15, -3, -6);
      c.fillStyle = "#c9bfa0"; c.beginPath(); c.moveTo(-4, -6); c.quadraticCurveTo(-14, -13, -24, -11); c.quadraticCurveTo(-14, -9, -2, -2.5); c.closePath(); c.fill();
      c.fillStyle = horn; c.beginPath(); c.moveTo(-1, -7.5); c.quadraticCurveTo(-11, -18, -22, -19); c.quadraticCurveTo(-11, -14, 2, -4); c.closePath(); c.fill();
      c.strokeStyle = "#c9bfa0"; c.lineWidth = .8; c.beginPath(); c.moveTo(-6, -11); c.lineTo(-5, -9); c.moveTo(-11, -14.5); c.lineTo(-10, -12.5); c.stroke();
      c.fillStyle = col; ell(c, 0, 0, 10, 8.5);
      c.beginPath(); c.moveTo(4, -6); c.quadraticCurveTo(13, -6, 19, -1.5); c.lineTo(19, 2.5); c.lineTo(5, 4); c.closePath(); c.fill();
      c.fillStyle = dark; c.beginPath(); c.moveTo(1, 3); c.lineTo(18, 2.5); c.lineTo(16, roar ? 9 : 5.5); c.lineTo(2, 7); c.closePath(); c.fill();
      if (roar) { c.fillStyle = "#5a1410"; c.beginPath(); c.moveTo(6, 3.2); c.lineTo(18, 2.6); c.lineTo(15.5, 7.4); c.closePath(); c.fill(); }
      c.fillStyle = "#fff"; tri(c, 9, 2.6, 10.2, 2.6, 9.6, 4.6); tri(c, 13, 2.6, 14.2, 2.6, 13.6, 4.4);
      c.fillStyle = dark; ell(c, 3, -5.6, 7, 2.2);
      c.fillStyle = "#ffde6b"; ell(c, 4, -3, 2.6, 2.2); c.fillStyle = "#1b1b1b"; ell(c, 4.4, -3, .7, 1.8);
      c.fillStyle = dark; ell(c, 17, -1.6, 1, .7);
      c.strokeStyle = belly; c.lineWidth = 1.1; c.beginPath(); c.moveTo(4, 7); c.quadraticCurveTo(3, 12, 0 + sway * .3, 15); c.moveTo(8, 7); c.quadraticCurveTo(8, 11, 6 + sway * .3, 13.5); c.stroke();
      if (roar) {
        c.fillStyle = "rgba(255,140,50,.55)"; tri(c, 18, 1, 32, -7, 32, 10);
        c.fillStyle = "#ffb347"; tri(c, 18, 1.5, 29, -3.5, 29, 7);
        c.fillStyle = "#fff0a8"; tri(c, 18, 2, 25, -.5, 25, 4.5);
      } else if (Math.sin(t * 2) > .3) { c.fillStyle = "rgba(220,220,220,.55)"; ell(c, 21, -4, 1.8, 1.6); ell(c, 24, -7, 1.3, 1.2); }
      c.restore();
      webWing(c, 4, -8, -1, 52, Math.max(.25, beat * .85), "#962f22", "#f0a060");
      c.fillStyle = "#e48a70"; ell(c, -20, -8 - 52 * .45 * beat * .5, 1.3, 1.3);
      c.restore(); break; }
    case "slimecube": case "slime": case "slimelet": {
      // a wobbling cube of green jelly with a face on the front; the big one has swallowed things on its way here
      const wob = Math.sin(t * 5 + (e.v || 0) * 6) * .07, w = r * (1 + wob), hh = r * (1 - wob), dp = r * .42, by = r * .85;
      const y0 = by - 2 * hh + dp, fx1 = w - dp;
      if (e.k === "slimecube") {   // what it ate: a skull, a sword and a gold coin, slowly turning inside
        c.save(); c.translate(-w * .35, y0 + hh * .9); c.rotate(Math.sin(t * .8) * .4);
        c.fillStyle = "#efe6cf"; ell(c, 0, 0, r * .2, r * .18); c.fillRect(-r * .12, r * .1, r * .24, r * .1);
        c.fillStyle = "#3b3226"; ell(c, -r * .07, -r * .02, r * .05, r * .05); ell(c, r * .07, -r * .02, r * .05, r * .05); c.restore();
        c.save(); c.translate(w * .2, y0 + hh * 1.2); c.rotate(.9 + Math.sin(t * .6) * .3);
        c.fillStyle = "#b9bec4"; c.fillRect(-r * .04, -r * .45, r * .08, r * .6); c.fillStyle = "#7a5532"; c.fillRect(-r * .14, r * .12, r * .28, r * .06); c.fillRect(-r * .04, r * .15, r * .08, r * .18); c.restore();
        c.fillStyle = "#f2c94c"; ell(c, w * .05, y0 + hh * .45, r * .1, r * .06);
      }
      const ink = "#2f6b35";
      c.fillStyle = "rgba(108,195,90,.72)"; c.fillRect(-w, y0, fx1 + w, by - y0);
      c.fillStyle = "rgba(70,150,62,.78)"; c.beginPath(); c.moveTo(fx1, y0); c.lineTo(w, y0 - dp); c.lineTo(w, by - dp); c.lineTo(fx1, by); c.closePath(); c.fill();
      c.fillStyle = "rgba(170,236,150,.85)"; c.beginPath(); c.moveTo(-w, y0); c.lineTo(fx1, y0); c.lineTo(w, y0 - dp); c.lineTo(-w + dp, y0 - dp); c.closePath(); c.fill();
      c.strokeStyle = ink; c.lineWidth = Math.max(1, r * .07); c.lineJoin = "round";
      c.beginPath(); c.moveTo(-w, by); c.lineTo(-w, y0); c.lineTo(-w + dp, y0 - dp); c.lineTo(w, y0 - dp); c.lineTo(w, by - dp); c.lineTo(fx1, by); c.closePath();
      c.moveTo(-w, y0); c.lineTo(fx1, y0); c.lineTo(w, y0 - dp); c.moveTo(fx1, y0); c.lineTo(fx1, by); c.stroke();
      c.fillStyle = "rgba(255,255,255,.45)"; c.fillRect(-w + r * .15, y0 + r * .15, r * .14, (by - y0) * .45);
      c.fillStyle = "rgba(108,195,90,.8)"; ell(c, -w * .5, by + r * .04, r * .18, r * .1); ell(c, fx1 * .6, by + r * .03, r * .14, r * .08);   // drips
      eyes(c, (fx1 - w) / 2 + r * .1, y0 + (by - y0) * .38, r * .3, r * .15);
      c.fillStyle = "#1f4a24"; ell(c, (fx1 - w) / 2 + r * .1, y0 + (by - y0) * .7, r * .2, r * .08 + Math.max(0, Math.sin(t * 3)) * r * .06);
      break; }
    case "wyrm": {
      // a dragon's skeleton walking on: ribcage with a cold light inside, bony wings with rags of membrane,
      // a chain of vertebrae for neck and tail, horned skull with a creaking jaw. Drawn at r = 24, then sized.
      const k = r / 24, step = Math.sin(t * 7), creak = Math.sin(t * 2.4), jaw = Math.max(0, Math.sin(t * 3)) * .22;
      const bone = e.col, shade = "#9c9482", glow = "#7ef0ff";
      const strokeBone = (w, pts, curve) => {
        for (const [col, lw] of [[shade, w + 1.6], [bone, w]]) {
          c.strokeStyle = col; c.lineWidth = lw; c.lineCap = "round"; c.lineJoin = "round"; c.beginPath(); c.moveTo(pts[0], pts[1]);
          if (curve) c.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); else for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
          c.stroke();
        }
      };
      c.save(); c.scale(k, k);
      // far wing: finger bones with torn membrane between
      const wing = (ox, oy, lift, tone) => {
        const ex = ox - 10, ey = oy - 22 - lift * 4, tips = [[-30, -30 - lift * 5], [-34, -14 - lift * 3], [-28, -2]];
        c.fillStyle = tone; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ex, ey);
        tips.forEach(([x, y], i) => { c.lineTo(x, y); if (i < 2) c.lineTo((x + tips[i + 1][0]) / 2 + 4, (y + tips[i + 1][1]) / 2 + 2); });
        c.lineTo(ox - 8, oy + 2); c.closePath(); c.fill();
        strokeBone(2.2, [ox, oy, ex, ey]); tips.forEach(([x, y]) => strokeBone(1.4, [ex, ey, x, y]));
      };
      wing(2, -10, creak * .6, "rgba(90,100,110,.28)");
      // tail: shrinking vertebrae on a swaying curve
      for (let i = 0; i < 9; i++) {
        const f = i / 8, x = -20 - f * 28, y = 4 - f * 8 + Math.sin(t * 4 - i * .7) * f * 4;
        c.fillStyle = shade; ell(c, x, y, 3.6 - f * 2 + .8, 2.8 - f * 1.4 + .8); c.fillStyle = bone; ell(c, x, y, 3.6 - f * 2, 2.8 - f * 1.4);
      }
      // far legs, then the body, then near legs, so it walks
      const leg = (hx, ph, near) => {
        const st = (near ? step : -step) * ph, kx = hx + 3 + st * 2.5, fx = hx + st * 4;
        strokeBone(near ? 3 : 2.6, [hx, 4, kx, 12, fx, 19]);
        c.fillStyle = near ? bone : shade; tri(c, fx, 18, fx + 5, 20.5, fx, 20.5); tri(c, fx, 18, fx - 3.5, 20.5, fx, 20.5);
        c.fillStyle = shade; ell(c, kx, 12, 1.8, 1.8);
      };
      leg(-15, 1, false); leg(10, -1, false);
      // the cold light that holds it together
      c.fillStyle = "rgba(20,30,40,.55)"; ell(c, -1, 2, 15, 9);
      const pulse = .25 + (Math.sin(t * 3.2) + 1) * .1;
      c.fillStyle = `rgba(126,240,255,${pulse})`; ell(c, 0, 2, 8, 5.5);
      c.fillStyle = `rgba(200,250,255,${pulse + .2})`; ell(c, 0, 2, 3, 2.2);
      c.fillStyle = shade; ell(c, -18, 3, 6.6, 5); c.fillStyle = bone; ell(c, -18, 3, 5.6, 4); c.fillStyle = "rgba(20,30,40,.6)"; ell(c, -17.5, 3.4, 2, 1.6);
      strokeBone(3.4, [-20, -3, -2, -12, 16, -8], true);
      for (let i = 0; i < 6; i++) {
        const x = -13 + i * 5.2, y = -6.4 - Math.sin((i + 1) / 7 * Math.PI) * 4.2;
        strokeBone(2.2, [x, y, x + 6, y + 9, x + 1, y + 15.5 - Math.abs(i - 2.5) * 1.2], true);
        c.fillStyle = bone; tri(c, x - 1.6, y, x + 1.6, y, x - .5, y - 3.6);
      }
      c.strokeStyle = shade; c.lineWidth = 1; c.beginPath(); c.moveTo(-6, 13); c.quadraticCurveTo(2, 15, 9, 11); c.stroke();
      leg(-12, -1, true); leg(12, 1, true);
      // near wing
      wing(4, -9, creak, "rgba(120,130,140,.32)");
      // neck vertebrae up to the skull
      for (let i = 0; i < 5; i++) {
        const f = i / 4, x = 15 + f * 13, y = -9 - f * 13 + Math.sin(f * Math.PI) * -2;
        c.fillStyle = shade; ell(c, x, y, 3.6, 3); c.fillStyle = bone; ell(c, x, y, 2.8, 2.3);
      }
      // skull: swept-back horns, long snout, open eye socket with the same cold light, a creaking lower jaw
      c.save(); c.translate(32, -25);
      c.fillStyle = shade; tri(c, -4, -5, -18, -15, -1, -8.5); c.fillStyle = bone; tri(c, -3.4, -5.6, -16.5, -14, -1.4, -8);
      c.fillStyle = shade; tri(c, 0, -6.5, -9, -18.5, 3, -9);
      c.save(); c.rotate(jaw);
      c.fillStyle = shade; c.beginPath(); c.moveTo(-4, 2); c.lineTo(14, 3.5); c.lineTo(13.5, 6); c.lineTo(-2, 6.5); c.closePath(); c.fill();
      c.fillStyle = "#f8f4e8"; for (let i = 0; i < 4; i++) tri(c, 1 + i * 3.2, 3, 2.6 + i * 3.2, 3, 1.8 + i * 3.2, .6);
      c.restore();
      c.fillStyle = bone; c.beginPath(); c.moveTo(-7, -2); c.quadraticCurveTo(-5, -9, 3, -8); c.quadraticCurveTo(8, -6, 15.5, -1.5); c.lineTo(15, 2.5); c.lineTo(-4, 3); c.closePath(); c.fill();
      c.fillStyle = "#f8f4e8"; for (let i = 0; i < 4; i++) tri(c, 2 + i * 3.2, 2.6, 3.6 + i * 3.2, 2.6, 2.8 + i * 3.2, 5.2);
      c.fillStyle = "#2a2433"; ell(c, 1, -3.4, 3.6, 3); ell(c, 12.6, -1.4, 1, .7);
      c.fillStyle = glow; ell(c, 1.4, -3.2, 1.4, 1.4); c.fillStyle = "rgba(126,240,255,.3)"; ell(c, 1.4, -3.2, 3, 2.6);
      c.strokeStyle = shade; c.lineWidth = .7; c.beginPath(); c.moveTo(-3.5, -7); c.lineTo(-2, -5); c.lineTo(-3, -3.5); c.moveTo(6, -6.4); c.lineTo(7.2, -4.4); c.stroke();
      c.restore();
      c.restore(); break; }
  }
}
// a hexed tower: a slow ring of violet runes round its base and sparks circling the top until the hex wears off
function hexMark(x, y, T) {
  const c = ctx, sp = reduceMotion ? 0 : time * 3;
  c.save(); c.globalAlpha = Math.min(1, T * 2);
  c.strokeStyle = "rgba(201,168,255,.9)"; c.lineWidth = 2; c.setLineDash([4, 4]); c.lineDashOffset = -sp * 6;
  c.beginPath(); c.ellipse(x, y - 2, 22, 9, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
  c.fillStyle = "#c9a8ff"; for (let i = 0; i < 3; i++) { const q = sp + i * 2.09; ell(c, x + Math.cos(q) * 15, y - 46 + Math.sin(q) * 5, 2, 2); }
  c.restore();
}
function drawEnemy(e) {
  if (e.k === "gate") return drawGate(e);
  const c = ctx, r = e.r, t = e.t;
  const bob = e.fly ? Math.sin(t * 5) * 3 : -Math.abs(Math.sin(t * 9)) * 2.5;
  const x = e.x, y = e.y + bob - (e.fly ? 22 : 0);
  c.fillStyle = e.fly ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.25)"; ell(c, e.x, e.y + r * .6, r * .9, r * .35);
  if (e.back) {   // a returning boss glows in its own colour
    const col = bossAura(e.k) || "#ffffff", p = Math.sin(time * 4);
    c.save(); c.globalAlpha = .28 + p * .08; c.fillStyle = col; ell(c, e.x, e.y + r * .6, r * 1.5, r * .6);
    c.globalAlpha = .75; c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r + 7 + p * 2, r + 7 + p * 2, 0, 0, Math.PI * 2); c.stroke(); c.restore();
  }
  c.save(); c.translate(x, y); c.scale(e.face * (e.sz || 1), e.sz || 1);
  enemyBody(c, e);
  c.restore();
  if (e.slowT > 0) { c.strokeStyle = "rgba(170,230,250,.85)"; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r + 3, r + 3, 0, 0, Math.PI * 2); c.stroke(); }
  if (e.hp < e.max) {
    const bw = Math.max(18, r * 2), f = Math.max(0, e.hp / e.max), by = y - r - (e.boss ? 16 : 9);
    c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 5);
    c.fillStyle = e.boss ? "#e2683e" : "#8cc06a"; c.fillRect(x - bw / 2, by, bw * f, 3);
  }
}
