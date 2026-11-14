# Endless Keep — shared leaderboard

A tiny JSON API for the installed app's Hall of Heroes. The game only knows the base URL (`LB_URL` in
`endless-keep.html`), so moving to another host means deploying this code there and changing that one line.

```
GET  /scores?v=N -> { "v", "scores": [ { "name", "best", "at", "badges" } ] }   (top 50 for rules version N)
GET  /versions   -> { "versions": [ { "v", "players" } ] }
POST /scores     <- { "token": "<32 hex>", "name", "level", "v", "badges" }
GET  /health     -> { "ok": true }
```

**Versions:** the game has `GAME_VERSION` (display only) and `RULES_VERSION` (an integer). Bump `RULES_VERSION`
whenever a balance change makes the game easier or harder: each rules version gets its own board, a game keeps the
rules version it started under, and older boards stay viewable from the picker in the Hall of Heroes.

## Files
| File | What it is | Provider-specific? |
|---|---|---|
| `src/core.js` | the whole API: validation, profanity filter, rate limits, CORS, security headers | no — standard `Request`/`Response` |
| `src/names.js` | name cleaning + profanity filter (a copy lives in the game too) | no |
| `src/store-d1.js` | storage adapter: 5 small functions (`top`, `get`, `put`, `hit`, `prune`) | yes — swap per host |
| `src/worker.js` | Cloudflare entry point (reads env, client IP header) | yes |
| `schema.sql` | tables (SQLite/D1/libSQL; Postgres with tiny changes) | — |

## Security model
- Names: NFKC-normalised, invisible/bidi/control characters removed, only letters/numbers/spaces/`'._!-`, max 16 characters, zalgo trimmed, profanity filter (look-alike swaps, spacing and repeated letters handled; Scunthorpe-safe whole-word list).
- The page renders names with `textContent` only and re-checks every field it reads back, so even a bad row can't run script.
- SQL uses bound parameters only. Bodies over 1 KB, non-JSON and wrong types are refused; errors never echo input.
- Writes accepted only from the allowed origins (`ALLOWED_ORIGINS`); CORS headers only for those origins.
- Each player has a secret random token; the server stores only a salted hash, so nobody can overwrite another player's score.
- Rate limits: 20 submissions per minute per (hashed) IP, and one save per player every 5 seconds.
- Responses carry `nosniff`, `default-src 'none'` CSP, `frame-ancestors 'none'`, HSTS, no-referrer.
- Limits: the game runs in the browser, so a determined cheater can still submit a made-up level. The server caps levels at 5000 and you can delete rows with `wrangler d1 execute ... --command "DELETE FROM players WHERE ..."`.

## Cloudflare (current host)
```sh
npm install
npx wrangler login
npx wrangler d1 create endless-keep-leaderboard          # put the id in wrangler.jsonc
npx wrangler d1 execute endless-keep-leaderboard --remote --file schema.sql
npx wrangler secret put HASH_SALT                        # any long random string
npx wrangler deploy
npm test                                                 # offline tests of the API
```

## Moving to another host
- **Deno Deploy / Bun:** `export default { fetch: req => handle(req, { store, origins, salt, ip }) }` with a store built on
  `bun:sqlite`, Deno KV or libSQL (Turso). Copy `store-d1.js` and change the 5 queries' driver calls.
- **Node 18+:** wrap `handle` with a small `http.createServer` adapter (or Hono's node adapter) and use `better-sqlite3`.
- **Postgres (Supabase, Neon, Railway):** same SQL, but `GREATEST(a, b)` instead of `max(a, b)` and `$1, $2…` placeholders.
- Then change `LB_URL` in the game and add the new host's address to nothing else — the game needs no other change.
