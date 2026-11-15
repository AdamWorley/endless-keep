// a worker thread: plays the games it's sent and posts back the results
import { parentPort } from "node:worker_threads";
import { playGame } from "./play.mjs";
parentPort.on("message", ({ id, genome, opts }) => {
  try { parentPort.postMessage({ id, result: playGame(genome, opts) }); }
  catch (err) { parentPort.postMessage({ id, error: String(err && err.stack || err) }); }
});
