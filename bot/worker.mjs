// a worker thread: plays the games it's sent (solo games, or live two-player matches when opts.match is set) and posts back the results
import { parentPort } from "node:worker_threads";
import { playGame } from "./play.mjs";
import { playMatch } from "./match.mjs";
parentPort.on("message", ({ id, genome, opts }) => {
  try { parentPort.postMessage({ id, result: opts.match ? playMatch(genome, opts.match.keeper, opts) : playGame(genome, opts) }); }
  catch (err) { parentPort.postMessage({ id, error: String(err && err.stack || err) }); }
});
