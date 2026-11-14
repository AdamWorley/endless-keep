// Cloudflare Workers entry point. Other hosts only need their own version of this file (see README.md).
import { handle } from "./core.js";
import { d1Store } from "./store-d1.js";

// Cloudflare Turnstile check, used when the TURNSTILE_SECRET secret is set: the token must pass and must have been
// issued on one of the game's own pages.
async function turnstile(secret, origins, token, ip) {
  const body = new FormData();
  body.append("secret", secret); body.append("response", token); if (ip) body.append("remoteip", ip);
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const d = r.ok ? await r.json() : null;
  return !!(d && d.success && origins.some(o => { try { return new URL(o).hostname === d.hostname; } catch { return false; } }));
}

export default {
  async fetch(request, env) {
    try {
      const origins = String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
      const ip = request.headers.get("CF-Connecting-IP") || "";
      return await handle(request, {
        store: d1Store(env.DB),
        origins,
        salt: env.HASH_SALT || "",
        ip,
        verifyHuman: env.TURNSTILE_SECRET ? (token, ip) => turnstile(env.TURNSTILE_SECRET, origins, token, ip) : undefined,
      });
    } catch {
      // never leak internals
      return new Response(JSON.stringify({ error: "server" }), { status: 500, headers: { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" } });
    }
  },
};
