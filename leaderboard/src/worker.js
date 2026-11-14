// Cloudflare Workers entry point. Other hosts only need their own version of this file (see README.md).
import { handle } from "./core.js";
import { d1Store } from "./store-d1.js";

export default {
  async fetch(request, env) {
    try {
      return await handle(request, {
        store: d1Store(env.DB),
        origins: String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean),
        salt: env.HASH_SALT || "",
        ip: request.headers.get("CF-Connecting-IP") || "",
      });
    } catch {
      // never leak internals
      return new Response(JSON.stringify({ error: "server" }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });
    }
  },
};
