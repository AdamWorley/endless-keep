// The game's source is endless-keep.html plus pieces in game/. Each `//#include game/x.js` line in the page is replaced
// by that file, so what players get (and the Claude artifact) is still one self-contained page.
//   node pwa/inline.mjs endless-keep.html > page.html
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function inline(file) {
  const dir = path.dirname(file);   // include paths are relative to the page, in pieces too (a piece can include another)
  const join = text => text.replace(/^\/\/#include (\S+)$/gm, (_, f) => join(readFileSync(path.join(dir, f), "utf8").replace(/\n$/, "")));
  return join(readFileSync(file, "utf8"));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) process.stdout.write(inline(process.argv[2] || "endless-keep.html"));
