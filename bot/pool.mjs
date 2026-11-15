// runs games on every core but one
import { Worker } from "node:worker_threads";
import os from "node:os";
export function makePool(size = Math.max(1, os.availableParallelism() - 1)) {
  const workers = [], queue = [], waiting = new Map(); let next = 0;
  const idle = [];
  const pump = () => { while (idle.length && queue.length) { const w = idle.pop(), job = queue.shift(); w.job = job; w.postMessage({ id: job.id, genome: job.genome, opts: job.opts }); } };
  for (let i = 0; i < size; i++) {
    const w = new Worker(new URL("./worker.mjs", import.meta.url));
    w.on("message", m => { const job = waiting.get(m.id); waiting.delete(m.id); idle.push(w); pump(); m.error ? job.reject(new Error(m.error)) : job.resolve(m.result); });
    w.on("error", e => { if (w.job) waiting.get(w.job.id)?.reject(e); });
    workers.push(w); idle.push(w);
  }
  return {
    size,
    play(genome, opts) { return new Promise((resolve, reject) => { const job = { id: next++, genome, opts, resolve, reject }; waiting.set(job.id, job); queue.push(job); pump(); }); },
    close() { for (const w of workers) w.terminate(); },
  };
}
