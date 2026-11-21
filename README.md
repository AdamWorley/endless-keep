# Endless Keep

A tower defence game where you hold a castle against endless waves of goblins, trolls and dragons. Build and upgrade
towers, plant trees, fortify the keep, and see how far you get. Heirlooms carry over between games, a Bestiary
records every monster you've met, and two players can face off online as the Keeper and the Dark Lord.

**Play:** <https://keep.watchtogether.uk/>. It installs to a phone or desktop home screen and works offline.

## What's in this repo

| Path | What it is |
|---|---|
| `endless-keep.html`, `game/` | The game: HTML, CSS and JavaScript with no dependencies. Self-contained parts of the script live in `game/` (towers and their art, monsters and their art, waves, the castle economy, special dragons, bestiary lore, the name filter, the wishing fish, the bot replay viewer), each marked in the page by a `//#include game/…` line. The build (`pwa/inline.mjs`) puts them back, so players still get one body-only page, which can also run as a Claude artifact. |
| `pwa/` | Turns the game into an installable app: `build.sh` wraps the page in a full document with the manifest, icons and offline service worker, writing to `dist/`. `check.mjs` sanity-checks a build. `serve.py` serves `dist/` locally. |
| `leaderboard/` | The shared Hall of Heroes: a small Cloudflare Worker with a D1 (SQLite) database. See [`leaderboard/README.md`](leaderboard/README.md). |
| `wrangler.jsonc`, `package.json` | The Cloudflare Pages project that serves the built game from `dist/` (static files only, no server code). |
| `.github/workflows/` | `game.yml` checks the game builds; `leaderboard.yml` tests the server. Cloudflare does the deploying. |
| `IDEAS.md` | The ideas backlog: ticked items are in the game. |

## Running it locally

```sh
npm install                # once, for wrangler
npm run build              # builds dist/ and checks it
python3 pwa/serve.py 8420  # then open http://localhost:8420 (or: npm run dev)
```

Open the built `dist/index.html` for a quick look. `endless-keep.html` itself won't run straight from disk, because its `game/` pieces are only put back by the build.

To try the leaderboard locally, run `npx wrangler dev --port 8788` in `leaderboard/` (first time:
`npx wrangler d1 execute endless-keep-leaderboard --local --file schema.sql`). Then, in the browser console on
`localhost:8420`, run `localStorage.ek_lb_dev = '"http://127.0.0.1:8788"'` and reload.

## Deploying

Pushing to `main` deploys everything:

- **The game**: Cloudflare Pages (Git integration, connected to this repo) runs `npm run build` and publishes `dist/`.
  Other branches get a preview at `<branch>.endless-keep.pages.dev`. GitHub Actions (`game.yml`) checks the build too.
  Installed copies pick up the new version the next time they're opened online.
- **The leaderboard**: GitHub Actions runs its tests, and Cloudflare (Workers Builds, connected to this repo)
  deploys it from `leaderboard/`. Its secrets live in Cloudflare, not GitHub: `HASH_SALT`, plus `TURNSTILE_SECRET` if
  the bot check is on.
- **The Claude artifact copy** isn't part of the pipeline and is republished by hand, from the one-file page that
  `node pwa/inline.mjs endless-keep.html > artifact.html` writes. It has its own Hall of Heroes,
  stored in the artifact's database.

### One-time Cloudflare setup for the game

1. **Workers & Pages → Create → Pages → Connect to Git**, pick this repo:
   - Project name `endless-keep` (matches `wrangler.jsonc`), production branch `main`, root directory `/`.
   - Framework preset None, build command `npm run build`, build output directory `dist`.
   - Settings → Builds → Build watch paths: include `endless-keep.html`, `game/*`, `pwa/*`, `wrangler.jsonc`, `package*.json`
     so leaderboard-only changes don't redeploy the game (and set the leaderboard Worker's watch paths to `leaderboard/*`).
2. **Turnstile → the Endless Keep widget → Hostnames**: add `keep.watchtogether.uk` and `endless-keep.pages.dev`,
   or new runs can't get a leaderboard ticket.

If Cloudflare gives the project a different `*.pages.dev` address (names are global), update it here, in
`ALLOWED_ORIGINS` in `leaderboard/wrangler.jsonc` and in `endless-keep.html`.

**Custom domain:** the game is on `keep.watchtogether.uk`. To add another: Pages project → Custom domains → add the hostname (a subdomain of a zone in this account gets its
DNS record automatically). Then add that origin to `ALLOWED_ORIGINS` in `leaderboard/wrangler.jsonc` (both blocks) and
to the Turnstile widget's hostnames. Players' saves are per-address, so they move with Export / import.

## Versions

The game has two version numbers, both near the top of the script in `endless-keep.html`:

- `GAME_VERSION`: shown to players. Bump it on any release.
- `RULES_VERSION`: bump it **only** when a balance change makes the game easier or harder. Each rules version has its
  own leaderboard, a game keeps the rules it started under, and older boards stay viewable.

The leaderboard's anti-cheat timing (`fastestWave` in `leaderboard/src/core.js`) mirrors the game's wave rules. If you
change how many monsters a wave has or how fast they arrive, update it too.

## Leaderboard fairness

Scores can't be fully verified because the game runs in the browser, but faking one is made hard:

- Each run gets a signed ticket from the server when it starts, and every score must carry it.
- A level is refused if it arrives sooner than the game allows, even at 3× speed. For example, level 100 can't be
  claimed within about 6 minutes of the run starting.
- Optionally, Cloudflare Turnstile checks for a person, usually invisibly, before a run gets a ticket.
- Players can't overwrite each other's entries. Names are filtered, and requests are rate limited.

Details are in [`leaderboard/README.md`](leaderboard/README.md).
