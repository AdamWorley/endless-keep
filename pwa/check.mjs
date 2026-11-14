// CI sanity check of a build: the page's inline script must parse, and the build must carry every file the
// service worker caches. Usage: node pwa/check.mjs dist
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2] || "dist", html = readFileSync(join(dir, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (scripts.length < 2) throw new Error(`expected the service-worker and game scripts, found ${scripts.length}`);
scripts.forEach((code, i) => { try { new Function(code); } catch (e) { throw new Error(`inline script ${i + 1} doesn't parse: ${e.message}`); } });
const sw = readFileSync(join(dir, "sw.js"), "utf8");
if (sw.includes("endless-keep-v1")) throw new Error("sw.js cache name wasn't bumped");
const shell = JSON.parse(sw.match(/const SHELL = (\[[^\]]*\])/)[1]).filter(f => f !== "./");
for (const f of shell) if (!existsSync(join(dir, f))) throw new Error(`missing ${f}`);
const ver = html.match(/GAME_VERSION = "([^"]+)", RULES_VERSION = (\d+)/);
console.log(`OK: ${scripts.length} scripts parse, ${shell.length} cached files present, game ${ver?.[1]} rules ${ver?.[2]}`);
