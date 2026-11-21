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
              pay: "Pay the toll", refuse: "Refuse" },
  wizard:   { kind: "choice", name: "Wandering wizard", cost: L => Math.round(35 * goldScale(L)),
              desc: L => `A wizard offers to bless your towers for ${Math.round(35 * goldScale(L))} gold: +30% damage this level.`,
              pay: "Pay the wizard", refuse: "No thanks" },
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
function askEvent() {
  const e = curEv(); if (!e || e.asked) return;
  e.asked = true;  // asked once; if you close it, the choice waits in "Coming in level" and auto stays on hold
  const E = EVENTS[e.id], L = S.level, c = E.cost(L), short = Math.ceil(c - S.gold);
  sfx("wave");
  openModal(card => {
    card.append(el("h2", "", E.name), el("p", "", E.desc(L)));
    const r = el("div", "row"), py = el("button", short > 0 ? "" : "primary", `${E.pay} · ${c} g`), no = el("button", short > 0 ? "primary" : "", E.refuse);
    py.disabled = short > 0;
    py.addEventListener("click", () => chooseEvent(true)); no.addEventListener("click", () => chooseEvent(false));
    r.append(py, no); card.append(r);
    if (short > 0) card.append(el("p", "fine", `You need ${short} more gold to pay.`));
    card.append(el("p", "fine", `Auto will start level ${L} once you've decided.`));
  }, () => { evAsking = false; });
  evAsking = true;
  if (short > 0) $("modalCard").querySelector(".row .primary").focus({ preventScroll: true });
}
