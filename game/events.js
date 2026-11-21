// Part of the game script in endless-keep.html. The build puts it back at its //#include line, inside the game's closure.
/* ---------- random events: some levels come with a twist, shown in "Up next" before they start ----------
   They get more frequent, and more often bad, the more heirlooms you bring into a game, to balance the upgrades. */
const EVENTS = {
  fog:      { kind: "bad",    name: "Fog",              desc: () => "Thick fog: every tower has 20% less range this level." },
  swift:    { kind: "bad",    name: "Tailwind",         desc: () => "Monsters move 20% faster this level." },
  ironclad: { kind: "bad",    name: "Scrap armour",     desc: () => "Monsters strap on scrap metal: +25% armour. Magic still pierces it." },
  horde:    { kind: "bad",    name: "Horde",            desc: () => "40% more monsters than usual this level." },
  stampede: { kind: "bad",    name: "Stampede",         from: 9, desc: () => "Every monster arrives riding a wolf, and there are 25% more of them." },
  storm:    { kind: "good",   name: "Thunderstorm",     desc: () => "Lightning strikes a monster every two seconds." },
  goldrush: { kind: "good",   name: "Gold rush",        desc: () => "Monsters drop double gold this level." },
  toll:     { kind: "choice", name: "Goblin toll",      cost: L => Math.round(45 * goldScale(L)),
              desc: L => `A goblin chief wants ${Math.round(45 * goldScale(L))} gold. Pay and 30% fewer monsters come. Refuse and 30% more come.`,
              pay: "Pay the toll", refuse: "Refuse", who: "goblin", say: "Nice castle you've got. Shame if a lot more of my lads turned up…" },
  wizard:   { kind: "choice", name: "Wandering wizard", cost: L => Math.round(35 * goldScale(L)),
              desc: L => `A wizard offers to bless your towers for ${Math.round(35 * goldScale(L))} gold: +30% damage this level.`,
              pay: "Pay the wizard", refuse: "No thanks", who: "wizard", say: "Ah, a keep! A little gold, and I'll put a spring in your towers' step." },
};
const runHeirlooms = () => Object.values(S.perks || {}).reduce((a, b) => a + b, 0);
function rollEvent(L) {
  if (L < 4 || L % 10 === 0 || S.vs) return null;
  const nb = runHeirlooms() + 3 * dyn();
  if (Math.random() > Math.min(.6, .22 + .02 * nb)) return null;
  const w = { good: 3, choice: 3, bad: 2.5 + .35 * nb };
  // rules v5: no fog before the first night (41), when Lanterns unlock to answer it
  const from = id => id === "fog" && rules5() ? nightFrom() : EVENTS[id].from || 0;
  const ids = Object.keys(EVENTS).filter(id => from(id) <= L);
  const tot = ids.reduce((a, id) => a + w[EVENTS[id].kind], 0); let r = Math.random() * tot;
  return { id: ids.find(id => (r -= w[EVENTS[id].kind]) <= 0) || ids[0], L, choice: null };
}
// change the planned wave for events that alter who turns up (so the preview counts are right)
function shapeWave(q, id, L) {
  const extra = f => { const base = q.filter(x => x.k !== "boss"), n = Math.round(base.length * f); for (let i = 0; i < n; i++) q.splice(Math.floor(Math.random() * (base.length + i)), 0, { ...base[(Math.random() * base.length) | 0] }); };
  if (id === "horde") extra(.4);
  if (id === "stampede") {
    const riders = ["wolfrider", "orcrider"].filter(k => ENEMIES[k].from <= L);
    q.forEach(x => { if (x.k !== "boss") x.k = riders[(Math.random() * riders.length) | 0]; });
    extra(.25);
  }
}
const curEv = () => (S && S.ev && S.ev.L === S.level) ? S.ev : null;
const evOn = id => { const e = curEv(); return !!e && e.id === id && (EVENTS[id].kind !== "choice" || e.choice === "pay"); };
// a toll or a wizard waiting for your answer: auto mode holds the next level until you've decided
const evPending = () => { const e = curEv(); return !!e && EVENTS[e.id].kind === "choice" && !e.choice; };
let evAsking = false;
function chooseEvent(pay) {
  const e = curEv(); if (!e || e.choice || S.phase !== "build") return;
  const E = EVENTS[e.id];
  if (pay) { const c = E.cost(S.level); if (S.gold < c) { toast(`You need ${c - Math.floor(S.gold)} more gold.`); return; } S.gold -= c; sfx("coin"); }
  e.choice = pay ? "pay" : "refuse";
  if (evAsking) closeModal();
  if (auto) S.nextT = Math.max(S.nextT, 2);  // a moment to see what you chose before the level starts
  schedulePersist(); renderUpNext(); renderPanel(); updateHud();
}
function askEvent(again) {
  const e = curEv(); if (!e || (e.asked && !again)) return;
  e.asked = true;  // asked once; if you close it, the choice waits in "Coming in level" and auto stays on hold
  const E = EVENTS[e.id], L = S.level, c = E.cost(L), short = Math.ceil(c - S.gold);
  sfx("wave");
  openModal(card => {
    const head = el("div", "evpop"), words = el("div");
    words.append(el("h2", "", E.name), el("p", "say", `“${E.say}”`), el("p", "", E.desc(L)));
    head.append(evPortrait(E.who), words); card.append(head);
    const r = el("div", "row"), py = el("button", short > 0 ? "" : "primary", `${E.pay} · ${c} g`), no = el("button", short > 0 ? "primary" : "", E.refuse);
    py.disabled = short > 0;
    py.addEventListener("click", () => chooseEvent(true)); no.addEventListener("click", () => chooseEvent(false));
    r.append(py, no); card.append(r);
    if (short > 0) card.append(el("p", "fine", `You need ${short} more gold to pay.`));
    if (auto) card.append(el("p", "fine", `Auto will start level ${L} once you've decided.`));
  }, () => { evAsking = false; });
  evAsking = true;
  if (short > 0) $("modalCard").querySelector(".row .primary").focus({ preventScroll: true });
}
// a painted portrait for an event's visitor: the goblin chief or the wandering wizard
function evPortrait(who) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 192; cv.className = "portrait"; cv.setAttribute("aria-hidden", "true");
  const g = cv.getContext("2d"); g.scale(2, 2); g.lineJoin = g.lineCap = "round";
  const ink = "#33261a", blob = (x, y, rx, ry, col) => { g.fillStyle = ink; ell(g, x, y, rx + 2, ry + 2); g.fillStyle = col; ell(g, x, y, rx, ry); };
  g.fillStyle = who === "wizard" ? "#2e3560" : "#3b4a2a"; g.beginPath(); g.arc(48, 48, 46, 0, Math.PI * 2); g.fill();   // backdrop
  if (who === "tree") {   // the spirit of a hexed tree: a gnarled face in the bark
    g.fillStyle = "#2a1f3a"; g.beginPath(); g.arc(48, 48, 46, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(90,230,160,.5)"; for (const [x, y] of [[16, 30], [80, 24], [76, 70], [20, 74]]) ell(g, x, y, 2, 2);
    blob(48, 30, 34, 22, "#2f5a36"); blob(30, 24, 14, 10, "#3d7045"); blob(66, 22, 14, 10, "#3d7045");   // leaves
    blob(48, 70, 20, 30, "#5a3f26");                                                                      // trunk
    g.strokeStyle = "#3e2a17"; g.lineWidth = 2; for (const x of [38, 47, 57]) { g.beginPath(); g.moveTo(x, 50); g.quadraticCurveTo(x + 3, 70, x - 1, 96); g.stroke(); }
    g.fillStyle = "#1c120a"; ell(g, 40, 62, 5, 4); ell(g, 56, 62, 5, 4);
    g.fillStyle = "#c08cff"; ell(g, 40, 62, 2.6, 2); ell(g, 56, 62, 2.6, 2);                              // glowing eyes
    g.fillStyle = "#1c120a"; g.beginPath(); g.moveTo(40, 78); g.quadraticCurveTo(48, 72, 56, 78); g.quadraticCurveTo(48, 86, 40, 78); g.fill();   // a scowl
    g.strokeStyle = "#1c120a"; g.lineWidth = 2.4; g.beginPath(); g.moveTo(34, 54); g.lineTo(44, 58); g.moveTo(62, 54); g.lineTo(52, 58); g.stroke();   // brows
  } else if (who === "wizard") {
    g.fillStyle = "rgba(255,240,180,.8)"; for (const [x, y] of [[18, 22], [78, 30], [70, 12], [24, 70]]) star(g, x, y, 3);
    blob(48, 92, 30, 26, "#5b3f9e");                                   // robe
    blob(48, 52, 15, 16, "#f0c9a0");                                   // face
    g.fillStyle = ink; g.beginPath(); g.moveTo(32, 54); g.quadraticCurveTo(48, 98, 64, 54); g.fill();          // beard
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.moveTo(34, 55); g.quadraticCurveTo(48, 94, 62, 55); g.quadraticCurveTo(48, 62, 34, 55); g.fill();
    g.fillStyle = ink; tri(g, 24, 44, 72, 44, 52, -2); g.fillStyle = "#6a4bb3"; tri(g, 27, 42, 69, 42, 52, 2);   // hat
    g.fillStyle = "#e9b949"; star(g, 46, 30, 4); g.fillStyle = ink; g.fillRect(24, 40, 48, 6); g.fillStyle = "#4a3585"; g.fillRect(26, 41, 44, 4);
    g.fillStyle = ink; ell(g, 42, 50, 2, 2.4); ell(g, 54, 50, 2, 2.4);                                        // eyes
    g.strokeStyle = ink; g.lineWidth = 4; g.beginPath(); g.moveTo(82, 30); g.lineTo(78, 96); g.stroke();      // staff
    g.strokeStyle = "#8a6034"; g.lineWidth = 2; g.stroke(); blob(82, 28, 5, 5, "#7fe0ff");
  } else {
    blob(48, 94, 28, 24, "#7a4e2c");                                   // jerkin
    blob(18, 46, 10, 6, "#7fae4a"); blob(78, 46, 10, 6, "#7fae4a");    // ears
    blob(48, 52, 22, 20, "#8bbd52");                                   // head
    g.fillStyle = ink; tri(g, 30, 34, 66, 34, 48, 34); g.fillStyle = "#e9b949";                                // crown
    g.beginPath(); g.moveTo(32, 36); g.lineTo(32, 22); g.lineTo(40, 30); g.lineTo(48, 18); g.lineTo(56, 30); g.lineTo(64, 22); g.lineTo(64, 36); g.closePath();
    g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); g.fill(); g.fillStyle = "#d8473b"; ell(g, 48, 30, 2.2, 2.2);
    g.fillStyle = "#fff6c8"; ell(g, 40, 48, 4.5, 4); ell(g, 57, 48, 4.5, 4); g.fillStyle = ink; ell(g, 41, 49, 2, 2.2); ell(g, 56, 49, 2, 2.2);   // eyes
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(37, 61); g.quadraticCurveTo(48, 70, 60, 59); g.stroke();   // grin
    g.fillStyle = "#fff6c8"; tri(g, 42, 64, 46, 64, 44, 68); tri(g, 52, 64, 56, 63, 54, 67);                 // teeth
    blob(74, 82, 7, 7, "#e9b949"); g.fillStyle = "#b8862a"; g.font = "bold 9px serif"; g.fillText("g", 71, 85);  // a coin
  }
  return cv;
}
