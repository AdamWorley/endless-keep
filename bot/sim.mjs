// Runs the real game (endless-keep.html) inside Node, with no browser: the page's script is loaded into a
// sandbox where every DOM, canvas and audio call goes to a harmless stand-in, Math.random is seeded, and a
// small hook exposes the game's own functions. The bot plays with exactly the rules players get.
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const GAME_FILE = process.env.EK_GAME || path.join(HERE, "..", "endless-keep.html");

// everything the bot needs from inside the game's closure
const HOOK = `
globalThis.__EK = {
  get S() { return S; }, get meta() { return meta; }, set meta(v) { meta = v; }, get season() { return season; },
  begin, startWave, update, checkSeason, lightAt, makeSave, placeTower, canBuild, gridSnap, tStats, upCost, tCost, keepStats, lockOf, glowReach,
  chop, plantSapling, plantCost, treeStage, woodValue, GROWTH, repairCost, wallCost, treasCost, treasPay, FORT, curEv, chooseEvent, EVENTS,
  TOWERS, TORDER, ENEMIES, ROAD, posAt, distRoad, CELL, W, H, CASTLE, dragonAt, bossFor, planFor, goldScale,
  RULES_VERSION, GAME_VERSION,
};
`;

let compiled = null;
function script() {
  if (compiled) return compiled;
  const html = fs.readFileSync(GAME_FILE, "utf8");
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  if (!m) throw new Error("no <script> in " + GAME_FILE);
  let src = m[1];
  const end = src.lastIndexOf("})();");
  if (end < 0) throw new Error("the game script should end with })();");
  src = src.slice(0, end) + HOOK + src.slice(end);
  compiled = new vm.Script(src, { filename: "endless-keep.js" });
  return compiled;
}

// a stand-in for any browser object: every property is another stand-in (remembered, so values you set stick),
// calling or constructing one gives a stand-in, it converts to 0 or "", and it iterates as empty
function stub() {
  const store = Object.create(null);
  const target = function () {};
  return new Proxy(target, {
    get(t, k) {
      if (k in store) return store[k];
      if (k === Symbol.toPrimitive) return hint => (hint === "number" ? 0 : "");
      if (k === Symbol.iterator) return function* () {};
      if (k === "then") return undefined;               // never look like a promise
      if (k === "length" || k === "width" || k === "height" || k === "clientWidth" || k === "clientHeight") return 0;
      if (k === "prototype") return t.prototype;
      return (store[k] = stub());
    },
    set(t, k, v) { store[k] = v; return true; },
    apply() { return stub(); },
    construct() { return stub(); },
  });
}

// mulberry32: small, fast and good enough for a game
export function seeded(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// a fresh copy of the game, ready at the start screen. perks: heirlooms to start with ({ id: count }), none by default
export function loadGame({ seed = 1, perks = {}, dynasty = 0 } = {}) {
  const ids = new Map();
  const elById = id => { if (!ids.has(id)) { const e = stub(); e.hidden = true; e.id = id; ids.set(id, e); } return ids.get(id); };
  const store = new Map();
  const localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k), clear: () => store.clear() };
  const document = stub();
  document.getElementById = elById;
  document.querySelector = () => stub();
  document.querySelectorAll = () => [];
  document.createElement = () => stub();
  document.hidden = false;
  const noop = () => 0;
  const ctx = {
    console, Math: Object.create(Math), JSON, Date, Promise, Object, Array, Map, Set, WeakMap, Number, String, Boolean, Symbol, Error, RegExp, Proxy, Reflect, Intl,
    Infinity, NaN, isNaN, isFinite, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, Uint8Array, Float32Array, TextEncoder, URL, Blob: stub(),
    document, localStorage, sessionStorage: localStorage, navigator: { vibrate: null, userAgent: "node", onLine: false, serviceWorker: null, clipboard: null },
    location: { href: "http://localhost/", search: "", hash: "", protocol: "http:", host: "localhost", hostname: "localhost", origin: "http://localhost", pathname: "/" },
    history: stub(), screen: stub(), performance: { now: () => 0 }, matchMedia: () => ({ matches: false, addEventListener: noop }),
    requestAnimationFrame: noop, cancelAnimationFrame: noop, setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop, queueMicrotask: noop,
    fetch: () => new Promise(() => {}),    // the network never answers: the game carries on offline
    Image: function () { return stub(); }, Path2D: function () { return stub(); }, ResizeObserver: function () { return stub(); },
    AudioContext: undefined, webkitAudioContext: undefined, crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 256) | 0; return a; } },
    confirm: () => false, alert: noop, prompt: () => null, addEventListener: noop, removeEventListener: noop, getComputedStyle: () => stub(),
    innerWidth: 1280, innerHeight: 900, devicePixelRatio: 1, Peer: undefined, turnstile: undefined,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  ctx.Math.random = seeded(seed);
  vm.createContext(ctx);
  script().runInContext(ctx);
  const G = ctx.__EK;
  // heirlooms come from the saved meta, which a fresh sandbox doesn't have: set them before begin()
  G.meta.perks = { ...perks }; G.meta.dynasty = dynasty;
  return G;
}
