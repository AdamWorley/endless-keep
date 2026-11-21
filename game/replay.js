// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
/* ---------- bot replays (local dev) ----------
   Open the game with #replay on the end of its address and drop in a file from `npm run bot:replay`. The file holds
   snapshots of the game (the same ones two-player mode sends the Dark Lord), about ten a second, and the board is
   drawn straight from them, moving things along in between. Nothing is played or saved, and it never touches your game. */
let RP = null;   // { meta, frames, i, t, speed, playing, tw, tr }
function replayApply(i) {
  const f = RP.frames[i];
  if (f.tw) RP.tw = f.tw;   // towers and trees are only stored when they change; aim and muzzle flash come every frame
  if (f.tr) RP.tr = f.tr;
  const tw = f.ta ? RP.tw.map((a, j) => { const b = a.slice(); b[4] = f.ta[2 * j]; b[5] = f.ta[2 * j + 1]; return b; }) : RP.tw;
  const was = S && S.vsGuest ? S : null;
  S = stateFromSnap({ ...f, tw, tr: RP.tr }); S.rv = RP.meta.rules;
  if (was && S.hitTotal > was.hitTotal && i === RP.i + 1) { const lost = S.hitTotal - was.hitTotal; castleHit(hitTier(lost, S.hp + lost, S.hp, S.maxHp), false); }
  RP.i = i;
}
function replaySeek(t) {
  const F = RP.frames; t = Math.max(0, Math.min(F[F.length - 1].g, t));
  let lo = 0, hi = F.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (F[m].g <= t) lo = m; else hi = m - 1; }
  // towers and trees come from the last frame that stored them
  RP.tw = RP.tr = null; for (let j = lo; j >= 0 && (!RP.tw || !RP.tr); j--) { if (!RP.tw && F[j].tw) RP.tw = F[j].tw; if (!RP.tr && F[j].tr) RP.tr = F[j].tr; }
  RP.t = t; RP.i = -1; replayApply(lo); replayHud(true);
}
function replayTick(dt) {
  if (!RP.playing) { time += dt; return; }
  const F = RP.frames, step = dt * RP.speed; RP.t += step;
  let j = RP.i; while (j + 1 < F.length && F[j + 1].g <= RP.t) j++;
  if (j !== RP.i) replayApply(j); else guestTick(step);
  if (RP.i >= F.length - 1) { RP.playing = false; replayHud(true); }
}
function replayLevelStart(L) { const f = RP.frames.find(q => q.L === L); return f ? f.g : 0; }
let rpKey = "";
function replayHud(force) {
  const bar = $("replayBar"); if (!bar || !RP.frames) return;
  const F = RP.frames, f = F[Math.max(0, RP.i)], key = [RP.i, RP.playing, RP.speed].join("|");
  $("hLevel").textContent = S.level; $("hGold").textContent = Math.floor(S.gold).toLocaleString(); $("hHearts").textContent = `${S.hp}/${S.maxHp}`;
  if (!force && key === rpKey) return; rpKey = key;
  bar.querySelector("[data-rp=play]").textContent = RP.playing ? "Pause" : RP.i >= F.length - 1 ? "Replay" : "Play";
  const sl = bar.querySelector("input[type=range]"); if (document.activeElement !== sl) sl.value = RP.t;
  const sel = bar.querySelector("select[data-rp=level]"); if (document.activeElement !== sel) sel.value = f.L;
  const lv = (RP.meta.levels || []).find(q => q.L === f.L);
  const log = document.querySelector(".rp-log"); if (log) { const was = log.querySelector("tr.now"), row = log.querySelector(`tr[data-l="${f.L}"]`); if (was !== row) { if (was) was.classList.remove("now"); if (row) { row.classList.add("now"); row.scrollIntoView({ block: "nearest" }); } } }
  bar.querySelector("[data-rp=info]").textContent = `Level ${f.L} · ${f.ph === "wave" ? "wave" : "building"}` +
    (lv ? ` · lost ${lv.hpLost} heart${lv.hpLost === 1 ? "" : "s"} · ${lv.towers} towers${lv.ev ? " · event: " + lv.ev : ""}` : "");
}
function replayStart(data) {
  if (!data || !Array.isArray(data.frames) || !data.frames.length || !data.meta) { toast("That isn't a replay file from npm run bot:replay."); return; }
  RP = { meta: data.meta, frames: data.frames, i: -1, t: 0, speed: 2, playing: true, tw: null, tr: null };
  setMap(data.meta.map ? { name: "Replay", road: data.meta.map } : DEFAULT_MAP);
  modalDone = null; closeModal(); $("startCard").hidden = true; $("overCard").hidden = true; sel = null;
  document.documentElement.classList.add("replay"); $("palette").textContent = ""; $("selPanel").textContent = "";
  replaySeek(0); seasonI = seasonIdx(S.level); season = SEASONS[seasonI]; buildBg(); amb = []; fadeT = 0;
  const M = data.meta, bar = $("replayBar"), levels = [...new Set(data.frames.map(q => q.L))];
  bar.querySelector("[data-rp=title]").textContent = `${M.strategy} · seed ${M.seed} · held ${M.held} levels${M.killedBy && M.killedBy.length ? " · fell to " + M.killedBy.join(", ") : ""}`;
  const sl = bar.querySelector("input[type=range]"); sl.max = data.frames[data.frames.length - 1].g; sl.step = .1;
  const ls = bar.querySelector("select[data-rp=level]"); ls.textContent = ""; levels.forEach(L => { const o = document.createElement("option"); o.value = L; o.textContent = "Level " + L; ls.append(o); });
  // the side panel: the whole game level by level; the recorded levels can be jumped to
  const p = $("selPanel"); p.textContent = "";
  p.append(el("h3", "", "Bot replay"), el("p", "hint", `Recorded levels ${levels[0]}–${levels[levels.length - 1]} of a game that held ${M.held}. Game ${M.game}, rules v${M.rules}. Click a recorded level to jump to it.`));
  const box = el("div", "rp-log"), tb = document.createElement("table"), body = document.createElement("tbody");
  tb.innerHTML = "<thead><tr><th>Level</th><th>Hearts lost</th><th>Gold</th><th>Towers</th><th>Event</th></tr></thead>";
  for (const q of M.levels || []) {
    const tr = document.createElement("tr"), rec = levels.includes(q.L); tr.dataset.l = q.L;
    for (const v of [q.L, q.hpLost, Math.floor(q.gold).toLocaleString(), q.towers, q.ev || ""]) tr.append(el("td", "", String(v)));
    if (rec) { tr.className = "rec"; tr.tabIndex = 0; const go = () => replaySeek(replayLevelStart(q.L)); tr.addEventListener("click", go); tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); }
    body.append(tr);
  }
  tb.append(body); box.append(tb); p.append(box);
  replayHud(true);
}
async function replayLoad(file) {
  try {
    const gz = /\.gz$/i.test(file.name) || new Uint8Array(await file.slice(0, 2).arrayBuffer()).join() === "31,139";
    const data = await new Response(gz ? file.stream().pipeThrough(new DecompressionStream("gzip")) : file).json();
    replayStart(data);
  } catch (e) { toast("Couldn't read that replay: " + e.message); }
}
function replayOpen() {
  const bar = document.createElement("div"); bar.id = "replayBar";
  bar.innerHTML = `<div class="rp-row"><b data-rp="title">Bot replay: choose a file from npm run bot:replay, or drop one on the page</b>
    <label class="rp-file"><input type="file" accept=".json,.gz,application/json,application/gzip"><span>Open replay…</span></label></div>
    <div class="rp-row"><button data-rp="prev" title="Previous level">‹ Level</button><button data-rp="play" class="primary">Play</button><button data-rp="next" title="Next level">Level ›</button>
    <select data-rp="speed" aria-label="Speed">${[.5, 1, 2, 4, 8, 16].map(v => `<option value="${v}"${v === 2 ? " selected" : ""}>${v}×</option>`).join("")}</select>
    <select data-rp="level" aria-label="Jump to level"></select><input type="range" min="0" max="1" value="0" aria-label="Position in the replay"><span data-rp="info"></span></div>`;
  document.body.append(bar);
  const q = k => bar.querySelector(k);
  q("input[type=file]").addEventListener("change", ev => { if (ev.target.files[0]) replayLoad(ev.target.files[0]); });
  document.addEventListener("dragover", ev => ev.preventDefault());
  document.addEventListener("drop", ev => { ev.preventDefault(); const f = ev.dataTransfer.files[0]; if (f) replayLoad(f); });
  q("[data-rp=play]").addEventListener("click", () => { if (!RP) return; if (RP.i >= RP.frames.length - 1) replaySeek(0); RP.playing = !RP.playing; replayHud(true); });
  q("[data-rp=speed]").addEventListener("change", ev => { if (RP) RP.speed = +ev.target.value; });
  q("[data-rp=level]").addEventListener("change", ev => { if (RP) replaySeek(replayLevelStart(+ev.target.value)); });
  q("input[type=range]").addEventListener("input", ev => { if (RP) replaySeek(+ev.target.value); });
  const hop = d => { if (!RP) return; const ls = [...new Set(RP.frames.map(f => f.L))], k = ls.indexOf(S.level) + d; if (k >= 0 && k < ls.length) replaySeek(replayLevelStart(ls[k])); };
  q("[data-rp=prev]").addEventListener("click", () => hop(-1)); q("[data-rp=next]").addEventListener("click", () => hop(1));
  document.addEventListener("keydown", ev => { if (!RP || ev.target.closest("input, select")) return; if (ev.key === " ") { ev.preventDefault(); q("[data-rp=play]").click(); } else if (ev.key === "ArrowRight") hop(1); else if (ev.key === "ArrowLeft") hop(-1); });
  RP = { meta: null, frames: null, playing: false };   // watching, but nothing loaded yet
  modalDone = null; closeModal(); $("startCard").hidden = true; paused = true;
}
