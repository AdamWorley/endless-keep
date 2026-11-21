# Endless Keep — shared leaderboard

A tiny JSON API for the installed app's Hall of Heroes. The game only knows the base URL (`LB_URL` in
`endless-keep.html`), so moving to another host means deploying this code there and changing that one line.

```
GET  /scores?v=N&map=M -> { "v", "map", "scores": [ { "name", "best", "at", "badges" } ] }   (top 50 for rules version N on map M)
GET  /versions   -> { "versions": [ { "v", "map", "players" } ] }
POST /runs       <- { "token": "<32 hex>", "v", "human"? }   -> { "ticket" }   (start of each run)
POST /scores     <- { "token", "ticket", "name", "level", "v", "map"?, "badges" }
GET  /health     -> { "ok": true }
```

**Versions:** the game has `GAME_VERSION` (display only) and `RULES_VERSION` (an integer). Bump `RULES_VERSION`
whenever a balance change makes the game easier or harder: each rules version gets its own board, a game keeps the
rules version it started under, and older boards stay viewable from the picker in the Hall of Heroes.

**Maps:** each built-in map has its own board for each rules version. `map` defaults to `meadow`, so older copies of
the game keep working. `MAPS` in `core.js` must list the game's built-in maps (`npm test` checks). Adding the map column
to an existing database is `migrations/0001-maps.sql`: run it on both databases before deploying a Worker that uses maps
(the old Worker stops saving scores once it has run, so deploy straight after).

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
- **Run tickets:** each run asks `POST /runs` for a ticket, which is signed with a key derived from `HASH_SALT` and tied to the player and rules version. A score without a valid ticket is refused. So is a level reached sooner after the ticket than the game allows (`fastestWave` in `core.js`: the quickest a wave's monsters can all arrive at 3× speed, with 20% slack, so level 10 needs about 23 s and level 100 about 6 min). Keep `fastestWave` in step with `makeWave()` in the game: `npm test` loads the real game and fails if they drift apart (or if `BADGES` or the name filter does). Without `HASH_SALT`, writes are refused (503), because tickets could be forged.
- **Turnstile (optional):** set the Worker secret `TURNSTILE_SECRET` and the game's `TS_SITEKEY`, and starting a run needs a passing Cloudflare Turnstile token issued on one of the allowed sites. 10 run starts per minute per IP.
- Limits: the game runs in the browser, so a patient cheater can still start a run, wait, and submit a made-up level that the timing allows. The server caps levels at 5000 and you can delete rows with `wrangler d1 execute ... --command "DELETE FROM players WHERE ..."`.

## Cloudflare (current host)
```sh
npm install
npx wrangler login
npx wrangler d1 create endless-keep-leaderboard          # put the id in wrangler.jsonc
npx wrangler d1 execute endless-keep-leaderboard --remote --file schema.sql
npx wrangler secret put HASH_SALT                        # any long random string; never change it afterwards
npx wrangler secret put TURNSTILE_SECRET                 # optional: Turnstile widget's secret key
npx wrangler deploy
npm test                                                 # offline tests of the API
```

Branch preview builds (Cloudflare Worker Previews) use the `previews` block in `wrangler.jsonc`, which points `DB` at a
separate test database, `endless-keep-leaderboard-preview`, so previews never write to the real Hall of Heroes. When
`schema.sql` changes, apply it there too:

```sh
npx wrangler d1 execute endless-keep-leaderboard-preview --remote --file schema.sql
```

## Moving to another host
- **Deno Deploy / Bun:** `export default { fetch: req => handle(req, { store, origins, salt, ip }) }` with a store built on
  `bun:sqlite`, Deno KV or libSQL (Turso). Copy `store-d1.js` and change the 5 queries' driver calls.
- **Node 18+:** wrap `handle` with a small `http.createServer` adapter (or Hono's node adapter) and use `better-sqlite3`.
- **Postgres (Supabase, Neon, Railway):** same SQL, but `GREATEST(a, b)` instead of `max(a, b)` and `$1, $2…` placeholders.
- Then change `LB_URL` in the game and add the new host's address to nothing else — the game needs no other change.
