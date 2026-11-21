// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
const DARK_DRAGON = { body: "#24222e", wing: "#15141c", belly: "#3d3a4d", fire: ["rgba(150,90,255,.45)", "#9b6bff", "#e6d9ff"] };
function drawTowerShape(c, type, x, y, ang, flash, lvl, name) {
  c.fillStyle = "rgba(0,0,0,.22)"; ell(c, x, y + 8, 24, 9);
  c.fillStyle = "#8d877a"; ell(c, x, y + 4, 22, 10);
  c.fillStyle = "#aaa395"; ell(c, x, y + 1, 19, 8);
  const face = Math.cos(ang) < 0 ? -1 : 1;
  switch (type) {
    case "archer": {
      const tier = archerTier({ type, lvl });
      if (tier && tier.shot === "bolt") {
        // Dragon Ballista: a squat stone tower with a great crossbow on a turntable, turning to aim
        c.fillStyle = "#857e70"; c.fillRect(x - 13, y - 24, 26, 26);
        c.fillStyle = "#a59d8c"; c.fillRect(x - 13, y - 24, 17, 26);
        for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? "#a59d8c" : "#857e70"; c.fillRect(x - 14 + i * 7.5, y - 30, 5.5, 7); }
        c.fillStyle = "#2c2018"; c.fillRect(x - 3, y - 15, 6, 8);
        c.fillStyle = "#5e4026"; ell(c, x, y - 26, 11, 4);
        const aim = Math.max(-0.7, Math.min(0.7, Math.atan2(Math.sin(ang), Math.abs(Math.cos(ang)))));
        c.save(); c.translate(x, y - 31); c.scale(face, 1); c.rotate(aim);
        const pull = flash > .3 ? 0 : 3;   // the string snaps forward as it fires, then winds back
        c.fillStyle = "#6c4a2b"; c.fillRect(-12, -2.5, 26, 5);
        c.fillStyle = "#4a321d"; c.fillRect(-12, -2.5, 6, 5);
        c.strokeStyle = "#3b2a1a"; c.lineWidth = 3; c.lineCap = "round";
        c.beginPath(); c.moveTo(4, -15); c.quadraticCurveTo(12, 0, 4, 15); c.stroke();
        c.strokeStyle = "#e9dcc0"; c.lineWidth = 1; c.beginPath(); c.moveTo(4, -15); c.lineTo(-pull, 0); c.lineTo(4, 15); c.stroke();
        if (flash < .3) { c.strokeStyle = "#5a3f26"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-pull, 0); c.lineTo(17, 0); c.stroke();
          c.fillStyle = "#cfd3d6"; tri(c, 16, -3, 16, 3, 22, 0); }
        c.restore();
        c.fillStyle = "#e9b949"; tri(c, x + 9, y - 30, x + 9, y - 44, x + 18, y - 40); c.strokeStyle = "#4a321d"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + 9, y - 30); c.lineTo(x + 9, y - 46); c.stroke();
        break;
      }
      c.fillStyle = "#6c4a2b"; c.fillRect(x - 11, y - 28, 22, 30);
      c.fillStyle = "#86603a"; c.fillRect(x - 11, y - 28, 15, 30);
      c.fillStyle = "#4a321d"; c.fillRect(x - 13, y - 30, 26, 5);
      c.fillStyle = "#2c2018"; c.fillRect(x - 3, y - 18, 6, 9);
      if (tier) {  // Longbow Tower: a green roof, a pennant, and a tall bow hung on the wall
        c.fillStyle = "#2f5a2c"; tri(c, x - 16, y - 29, x + 16, y - 29, x, y - 54);
        c.fillStyle = "#3d7a38"; tri(c, x - 16, y - 29, x, y - 29, x, y - 54);
        c.strokeStyle = "#4a321d"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 54); c.lineTo(x, y - 64); c.stroke();
        c.fillStyle = "#e9b949"; tri(c, x, y - 64, x, y - 58, x + 8 + Math.sin(time * 3) * 1.5, y - 61);
        c.strokeStyle = "#3b2a1a"; c.lineWidth = 1.6; c.beginPath(); c.arc(x - 16, y - 13, 12, -1.1, 1.1); c.stroke();
        c.strokeStyle = "#e9dcc0"; c.lineWidth = .8; c.beginPath(); c.moveTo(x - 16 + 12 * Math.cos(-1.1), y - 13 + 12 * Math.sin(-1.1)); c.lineTo(x - 16 + 12 * Math.cos(1.1), y - 13 + 12 * Math.sin(1.1)); c.stroke();
        break;
      }
      c.fillStyle = "#a3442e"; tri(c, x - 16, y - 29, x + 16, y - 29, x, y - 50);
      c.fillStyle = "#c25a3e"; tri(c, x - 16, y - 29, x, y - 29, x, y - 50);
      break;
    }
    case "mage": {
      // Mage Tower; from level 5 a Wizard's Tower (stone plinth, gold band and trim, rune stones circling the orb);
      // from level 10 an Arcane Spire (deep violet, a crystal spire for a roof, a turning ring of runes). The orb stays put
      const look = lookOf(lvl), p = 5 + Math.sin(time * 4) * 1.2 + flash * 4 + look;
      if (look) { c.fillStyle = "#8d877a"; c.fillRect(x - 13, y - 6, 26, 8); c.fillStyle = "#aaa395"; c.fillRect(x - 13, y - 6, 18, 3); }
      c.fillStyle = look === 2 ? "#3f3470" : "#58507a"; c.fillRect(x - 10, y - 34, 20, 36);
      c.fillStyle = look === 2 ? "#54469a" : "#7068a0"; c.fillRect(x - 10, y - 34, 13, 36);
      c.fillStyle = "#f3d77a"; c.beginPath(); c.arc(x, y - 18, 3.5, Math.PI, 0); c.lineTo(x + 3.5, y - 12); c.lineTo(x - 3.5, y - 12); c.fill();
      if (look) { c.fillStyle = "#e9b949"; c.fillRect(x - 10, y - 27, 20, 2.5); }
      if (look === 2) {   // a crystal spire
        c.fillStyle = "#2f2856"; c.fillRect(x - 13, y - 35, 26, 4);
        c.fillStyle = "#b9a2f0"; c.beginPath(); c.moveTo(x + 2, y - 60); c.lineTo(x + 9, y - 35); c.lineTo(x - 5, y - 35); c.closePath(); c.fill();
        c.fillStyle = "#e3d2ff"; c.beginPath(); c.moveTo(x + 2, y - 60); c.lineTo(x - 5, y - 35); c.lineTo(x + 1, y - 35); c.closePath(); c.fill();
      } else {
        c.fillStyle = "#2f2856"; tri(c, x - 14, y - 32, x + 14, y - 32, x + 2, y - 62);
        if (look) {   // a gold-trimmed roof scattered with stars
          c.strokeStyle = "#e9b949"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 14, y - 32); c.lineTo(x + 14, y - 32); c.stroke();
          c.fillStyle = "#f3d77a"; for (const [sx, sy, r] of [[-4, -38, 1.6], [5, -44, 1.3], [-1, -50, 1.1], [7, -36, 1.2]]) { c.beginPath(); c.moveTo(x + sx, y + sy - r * 1.8); c.lineTo(x + sx + r * .6, y + sy); c.lineTo(x + sx, y + sy + r * 1.8); c.lineTo(x + sx - r * .6, y + sy); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x + sx - r * 1.8, y + sy); c.lineTo(x + sx, y + sy + r * .6); c.lineTo(x + sx + r * 1.8, y + sy); c.lineTo(x + sx, y + sy - r * .6); c.closePath(); c.fill(); }
        }
      }
      c.fillStyle = "rgba(201,168,255,.28)"; ell(c, x + 2, y - 66, p * 2, p * 2);
      c.fillStyle = "#e3d2ff"; ell(c, x + 2, y - 66, p * .8, p * .8);
      if (look === 2) {   // the ring of runes, tilted, turning
        c.strokeStyle = "rgba(201,168,255,.75)"; c.lineWidth = 1.2; c.setLineDash([3, 3]); c.lineDashOffset = -time * 12;
        c.beginPath(); c.ellipse(x + 2, y - 66, 15, 5, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
      }
      for (let i = 0; i < (look === 2 ? 3 : look ? 2 : 0); i++) {   // rune stones circling the orb
        const a = time * 1.8 + i * Math.PI * 2 / (look === 2 ? 3 : 2), rx = x + 2 + Math.cos(a) * (look === 2 ? 15 : 11), ry = y - 66 + Math.sin(a) * (look === 2 ? 5 : 4);
        c.fillStyle = Math.sin(a) > 0 ? "#c9a8ff" : "#8f74d6"; c.beginPath(); c.moveTo(rx, ry - 2.6); c.lineTo(rx + 1.8, ry); c.lineTo(rx, ry + 2.6); c.lineTo(rx - 1.8, ry); c.closePath(); c.fill();
      }
      break;
    }
    case "frost": {
      // Frost Spire; from level 5 an Ice Spire (a ring of shards, a snowy base, a taller crystal); from level 10 a
      // Glacier Spire (ice blocks, a tall glowing crystal, shards circling it in a ring of frost)
      const look = lookOf(lvl), glow = .5 + Math.sin(time * 3) * .2 + flash, top = [52, 57, 63][look];
      c.fillStyle = `rgba(160,225,245,${(.18 + look * .06) * glow})`; ell(c, x, y - 22 - look * 3, 22 + look * 3, 26 + look * 4);
      if (look) { c.fillStyle = "#eef8fb"; ell(c, x, y + 1, 18, 5); }
      if (look === 2) { c.fillStyle = "#bfe6f2"; c.fillRect(x - 17, y - 7, 9, 7); c.fillRect(x + 8, y - 7, 9, 7); c.fillStyle = "#dff3f9"; c.fillRect(x - 17, y - 7, 9, 2.5); c.fillRect(x + 8, y - 7, 9, 2.5); }
      const shard = (bx, h, w, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(bx - w, y - 2); c.lineTo(bx + (bx < x ? -3 : 3), y - h); c.lineTo(bx + w, y - 2); c.closePath(); c.fill(); };
      if (look) { shard(x - 18, 18, 3, "#8fcbdd"); shard(x + 18, 20, 3, "#8fcbdd"); }
      c.fillStyle = "#6fb6cf"; c.beginPath(); c.moveTo(x - 12, y - 2); c.lineTo(x - 16, y - 22); c.lineTo(x - 8, y - 4); c.fill();
      c.beginPath(); c.moveTo(x + 10, y - 2); c.lineTo(x + 16, y - 26); c.lineTo(x + 5, y - 4); c.fill();
      c.fillStyle = "#a9e2f2"; c.beginPath(); c.moveTo(x, y - top); c.lineTo(x + 10, y - 22); c.lineTo(x, y); c.lineTo(x - 10, y - 22); c.closePath(); c.fill();
      c.fillStyle = "#e3f7fd"; c.beginPath(); c.moveTo(x, y - top); c.lineTo(x - 10, y - 22); c.lineTo(x, y); c.closePath(); c.fill();
      if (look === 2) {
        c.fillStyle = `rgba(255,255,255,${.5 + Math.sin(time * 3) * .25})`; ell(c, x - 1, y - 30, 2.4, 6);   // light inside the crystal
        c.strokeStyle = "rgba(200,240,252,.7)"; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y - 30, 20, 6, 0, 0, Math.PI * 2); c.stroke();
        for (let i = 0; i < 3; i++) {   // shards circling it
          const a = time * 1.4 + i * Math.PI * 2 / 3, sx = x + Math.cos(a) * 20, sy = y - 30 + Math.sin(a) * 6;
          c.fillStyle = Math.sin(a) > 0 ? "#e3f7fd" : "#9ed6e6"; c.beginPath(); c.moveTo(sx, sy - 4); c.lineTo(sx + 2, sy); c.lineTo(sx, sy + 4); c.lineTo(sx - 2, sy); c.closePath(); c.fill();
        }
      }
      break;
    }
    case "catapult": {
      // Catapult; from level 5 a Heavy Catapult (iron-rimmed wheels, iron bands, a stone counterweight, a pile of
      // boulders); from level 10 a Trebuchet (a tall A-frame with a long arm, a heavy counterweight and a sling)
      const look = lookOf(lvl), throwA = Math.min(1, flash * 2);
      if (look === 2) {
        c.fillStyle = "#3b2a1a"; for (const wx of [-15, -5, 5, 15]) ell(c, x + wx, y + 2, 3.6, 3.6);
        c.fillStyle = "#7a5532"; c.fillRect(x - 20, y - 6, 40, 6);
        c.fillStyle = "#4a4d52"; c.fillRect(x - 12, y - 6, 2.5, 6); c.fillRect(x + 9.5, y - 6, 2.5, 6);
        c.strokeStyle = "#6b4a2b"; c.lineWidth = 3.4; c.lineCap = "round";
        c.beginPath(); c.moveTo(x - 14, y - 5); c.lineTo(x, y - 36); c.lineTo(x + 14, y - 5); c.moveTo(x - 8, y - 18); c.lineTo(x + 8, y - 18); c.stroke();
        c.save(); c.translate(x, y - 36); c.scale(face, 1); c.rotate(-1.15 + throwA * 1.9);
        c.strokeStyle = "#8c6640"; c.lineWidth = 3.2; c.beginPath(); c.moveTo(9, 9); c.lineTo(-9, -30); c.stroke();
        c.fillStyle = "#5c5f66"; c.fillRect(5, 7, 10, 9); c.fillStyle = "#73777f"; c.fillRect(5, 7, 10, 2.5);   // counterweight
        c.strokeStyle = "#3b2a1a"; c.lineWidth = 1; c.beginPath(); c.moveTo(-9, -30); c.lineTo(-15, -22); c.stroke();     // sling
        if (flash < .2) { c.fillStyle = "#8b8b8b"; ell(c, -15, -20, 4, 4); }
        c.restore();
        c.fillStyle = "#e9b949"; tri(c, x, y - 37, x, y - 47, x + 7, y - 44); c.strokeStyle = "#4a321d"; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y - 36); c.lineTo(x, y - 48); c.stroke();
        break;
      }
      c.fillStyle = "#3b2a1a"; ell(c, x - 12, y + 2, 5 + look, 5 + look); ell(c, x + 12, y + 2, 5 + look, 5 + look);
      if (look) { c.strokeStyle = "#5c5f66"; c.lineWidth = 1.4; c.beginPath(); c.arc(x - 12, y + 2, 5.2, 0, Math.PI * 2); c.moveTo(x + 17.2, y + 2); c.arc(x + 12, y + 2, 5.2, 0, Math.PI * 2); c.stroke(); }
      c.fillStyle = "#7a5532"; c.fillRect(x - 17, y - 8, 34, 8);
      if (look) { c.fillStyle = "#4a4d52"; c.fillRect(x - 13, y - 8, 2.5, 8); c.fillRect(x + 10.5, y - 8, 2.5, 8); }
      c.fillStyle = "#5e4026"; c.fillRect(x - 3, y - 20, 6, 14);
      c.save(); c.translate(x, y - 14); c.scale(face, 1);
      c.rotate(-0.9 + throwA * 1.2);
      c.strokeStyle = "#8c6640"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(6, 6); c.lineTo(-4, -26); c.stroke();
      if (look) { c.fillStyle = "#6e7178"; c.fillRect(3, 4, 8, 7); }   // stone counterweight
      c.fillStyle = "#5e4026"; ell(c, -5, -28, 6, 4);
      if (flash < .2) { c.fillStyle = "#8b8b8b"; ell(c, -5, -31, 4, 4); }
      c.restore();
      if (look) { c.fillStyle = "#7d7a74"; ell(c, x + 19, y + 3, 3.2, 3); ell(c, x + 23, y + 4, 2.8, 2.6); c.fillStyle = "#a19d95"; ell(c, x + 21, y + 0, 2.8, 2.6); }
      break;
    }
    case "lantern": {
      // a wooden post with an iron lantern hanging off its arm; a second lantern from level 4, a brass cap from level 7
      c.fillStyle = "#5a3e26"; c.fillRect(x - 3.5, y - 46, 7, 48);
      c.fillStyle = "#7a5634"; c.fillRect(x - 3.5, y - 46, 3.5, 48);
      c.fillStyle = "#4a321d"; c.fillRect(x - (lvl >= 4 ? 15 : 4), y - 48, lvl >= 4 ? 30 : 19, 4);
      const lamp = (lx, ly) => {
        const f = .85 + Math.sin(time * 7 + lx) * .09 + Math.sin(time * 11.3 + ly) * .06;
        c.fillStyle = `rgba(255,214,120,${(season && season.night ? .34 : .2) * f})`; ell(c, lx, ly + 1, 17 * f, 17 * f);
        c.strokeStyle = "#2e2116"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(lx, y - 44); c.lineTo(lx, ly - 9); c.stroke();
        c.fillStyle = "#ffe9a8"; c.fillRect(lx - 5, ly - 6, 10, 12);
        c.fillStyle = "#ffae3d"; ell(c, lx, ly + 1, 2.6 * f, 3.6 * f);
        c.strokeRect(lx - 5, ly - 6, 10, 12); c.beginPath(); c.moveTo(lx, ly - 6); c.lineTo(lx, ly + 6); c.stroke();
        c.fillStyle = lvl >= 7 ? "#e9b949" : "#2e2116"; tri(c, lx - 7, ly - 6, lx + 7, ly - 6, lx, ly - 12); c.fillRect(lx - 6, ly + 6, 12, 2.5);
      };
      lamp(x + 11, y - 32);
      if (lvl >= 4) lamp(x - 11, y - 32);
      break;
    }
    case "dragon": {
      c.fillStyle = "#6d5134"; ell(c, x, y - 2, 20, 8);
      c.strokeStyle = "#8a6a44"; c.lineWidth = 1.5; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(x - 18, y - 2 + i * 2); c.lineTo(x + 18, y - 4 - i * 2); c.stroke(); }
      const sp = SECRET_DRAGONS[secretKey(name)] || {};
      const ds = { ...dragonStage(lvl), ...(sp.dark ? DARK_DRAGON : sp.look || {}) }, sc = sp.tiny ? .7 : ds.s;
      c.save(); c.translate(x, y - 10); c.scale(face * sc, sc);
      const flap = Math.sin(time * 5) * 6;
      c.fillStyle = ds.wing; tri(c, -2, -4, -16, -26 - flap, 8, -6);
      c.fillStyle = ds.body; ell(c, 0, 0, 13, 8);
      c.fillStyle = ds.belly; ell(c, 2, 3, 8, 4);
      c.strokeStyle = ds.body; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(-10, 2); c.quadraticCurveTo(-22, 2, -20, -8); c.stroke();
      if (lvl >= 4) { c.fillStyle = ds.wing; tri(c, -9, -5, -6, -11, -3, -6); tri(c, -3, -7, 0, -13, 3, -7); }
      if (ds.axolotl) {  // a wide, round head and a little smile; the feathery gills go on after the near wing
        c.fillStyle = ds.body; ell(c, 13, -7, 8.5, 6.5); ell(c, 19, -5.5, 4.5, 4);
        c.fillStyle = "#1b1b1b"; ell(c, 15, -9.5, 1.5, 1.5);
        c.strokeStyle = "#9c3a5f"; c.lineWidth = 1; c.beginPath(); c.arc(18, -6, 3.2, .35, 1.45); c.stroke();
        if (lvl >= 7) { c.fillStyle = lvl >= 10 ? "#fff3c4" : "#e9b949"; ell(c, 12, -13.5, 2, 1.4); }  // a tiny crown of sparkle as it grows
      } else {
        c.fillStyle = ds.body; ell(c, 12, -8, 7, 6); ell(c, 18, -6, 5, 3.5);
        c.fillStyle = lvl >= 10 ? "#fff3c4" : "#e9b949"; tri(c, 8, -12, 6, -20, 12, -13);
        if (lvl >= 7) tri(c, 12, -13, 13, -21, 15, -12);
        c.fillStyle = "#1b1b1b"; ell(c, 13, -10, 1.6, 1.6);
      }
      c.fillStyle = ds.wing; tri(c, 2, -4, 10, -24 + flap, 12, -4);
      if (ds.axolotl) {  // three feathery gills fanning up and back from the head, swaying gently
        const sway = Math.sin(time * 3) * .1;
        c.lineCap = "round"; c.fillStyle = ds.gill; c.strokeStyle = ds.gill;
        for (const [bx, by, a0, len] of [[9, -10, -2.5, 10], [11, -12, -2.0, 11.5], [14, -12.5, -1.55, 10]]) {
          const a = a0 + sway, ux = Math.cos(a), uy = Math.sin(a);
          c.lineWidth = 2.2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + ux * len, by + uy * len); c.stroke();
          for (let k = .35; k <= 1.01; k += .22) {  // little frills on both sides of each stalk
            const px = bx + ux * len * k, py = by + uy * len * k;
            ell(c, px - uy * 2, py + ux * 2, 1.5, 1.5); ell(c, px + uy * 2, py - ux * 2, 1.5, 1.5);
          }
        }
      }
      if (lvl >= 10 && Math.sin(time * 3) > .6) { c.fillStyle = "rgba(255,250,210,.95)"; ell(c, -2, -10, 1.6, 1.6); ell(c, 6, 2, 1.2, 1.2); }
      c.restore();
      break;
    }
  }
  if (lvl > 1) {
    c.fillStyle = "#e9b949"; ell(c, x + 17, y + 6, 8.5, 8.5);
    c.fillStyle = "#2a1d05"; c.font = "800 11px 'Alegreya Sans', sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText(String(lvl), x + 17, y + 6.5); c.textBaseline = "alphabetic";
  }
}
