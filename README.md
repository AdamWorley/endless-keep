# Endless Keep

A tower defence game where you hold a castle against endless waves of goblins, trolls and dragons. Build and upgrade
towers, plant trees, fortify the keep, and see how far you get. Heirlooms carry over between games, and two players can
face off online as the Keeper and the Dark Lord.

**Play:** <https://adamworley.github.io/endless-keep/>. It installs to a phone or desktop home screen and works offline.

## What's in this repo

| Path | What it is |
|---|---|
| `endless-keep.html` | The whole game: one file with HTML, CSS and JavaScript and no dependencies. It's a body-only page so it can also run as a Claude artifact. |
| `pwa/` | Turns the game into an installable app: `build.sh` wraps the page in a full document with the manifest, icons and offline service worker, writing to `dist/`. `check.mjs` sanity-checks a build. `serve.py` serves `dist/` locally. |
| `leaderboard/` | The shared Hall of Heroes: a small Cloudflare Worker with a D1 (SQLite) database. See [`leaderboard/README.md`](leaderboard/README.md). |
| `.github/workflows/` | `pages.yml` builds and publishes the game; `leaderboard.yml` tests the server. |
| `IDEAS.md` | The ideas backlog: ticked items are in the game. |

## Running it locally

```sh
sh pwa/build.sh            # builds dist/
python3 pwa/serve.py 8420  # then open http://localhost:8420
```

Opening `endless-keep.html` directly in a browser also works for a quick look, without the install and offline parts.

To try the leaderboard locally, run `npx wrangler dev --port 8788` in `leaderboard/` (first time:
`npx wrangler d1 execute endless-keep-leaderboard --local --file schema.sql`). Then, in the browser console on
`localhost:8420`, run `localStorage.ek_lb_dev = '"http://127.0.0.1:8788"'` and reload.

## Deploying

Pushing to `main` deploys everything:

- **The game**: GitHub Actions builds `dist/`, checks it, and publishes it to GitHub Pages. Installed copies pick up
  the new version the next time they're opened online.
- **The leaderboard**: GitHub Actions runs its tests, and Cloudflare (Workers Builds, connected to this repo)
  deploys it from `leaderboard/`. Its secrets live in Cloudflare, not GitHub: `HASH_SALT`, plus `TURNSTILE_SECRET` if
  the bot check is on.
- **The Claude artifact copy** isn't part of the pipeline and is republished by hand. It has its own Hall of Heroes,
  stored in the artifact's database.

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
