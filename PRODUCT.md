# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Mainly the owner's friends and family. They play in short sessions on a phone, often installed to the home screen, or on a desktop browser. They pick it up casually, but some of them stay for long runs, chase each other on the shared Hall of Heroes, and play the two-player mode together. The game is free, with no monetisation and no wider public audience to win over.

## Product Purpose

Endless Keep is a tower-defence game: hold a castle against endless waves of goblins, trolls and dragons by building and upgrading towers, planting trees and fortifying the keep. Success is a game the people it's made for keep coming back to, with runs that feel different each time, and that they can compare and play together.

## Positioning

The combination is the point; no one feature is the hook:

- **Endless, with meta-progression.** The waves never stop, and heirlooms, dynasties (prestige ranks) and random events make each run feel different and build on the last.
- **One tiny file.** The whole game is a single dependency-free HTML file. It runs offline as an installed PWA and also as a Claude artifact.
- **Keeper vs Dark Lord.** An asymmetric online two-player mode: one player defends while the other secretly builds and steers the attacking army.

## Operating Context

- Played at https://endless-keep.pages.dev/, installed as a fullscreen PWA, or opened as a Claude artifact. The artifact copy has its own Hall of Heroes, stored in the artifact's database.
- Sessions are short and interruptible. Players move saved games and heirlooms between devices, and between the app and the Claude page, with export/import codes.
- Players often run at 3× speed and often play with sound off, so moment-to-moment events are easy to miss.
- Two-player matches use a 5-letter code (PeerJS matchmaking, then a direct connection) and last 10, 20 or 30 levels.
- The Hall of Heroes is a Cloudflare Worker with a D1 database (`leaderboard/`). Each `RULES_VERSION` has its own board.

## Capabilities and Constraints

- **Single HTML file.** Everything lives in `endless-keep.html`, with no dependencies and no external images or scripts; the art is drawn on canvas. The one external resource is Google Fonts (Uncial Antiqua and Alegreya Sans), which have system fallbacks and which the service worker caches for offline play. The page is body-only so it can run as a Claude artifact. `pwa/build.sh` wraps it for the installed app.
- **Touch-first on phones.** It must be playable with one thumb on a small screen, in portrait or landscape (the manifest sets `orientation: any`). Desktop and mouse also work.
- **Offline-capable.** Nothing may need the network except the Hall of Heroes and two-player mode, and both must fail gracefully when offline.
- **Versioning.** `GAME_VERSION` is shown to players and is bumped on every release. `RULES_VERSION` is bumped only when a balance change makes the game easier or harder. The leaderboard's anti-cheat timing (`fastestWave`) mirrors the wave rules.
- **Terminology:** Keeper, Dark Lord, dread, heirlooms (Common / Rare / Epic / Legendary), dynasties and House rank, Hall of Heroes, Bestiary, Up next, saplings, levels (not "waves" in the UI).
- The backlog of ideas, with shipped ones ticked, is in `IDEAS.md`.

## Brand Commitments

- The name is **Endless Keep**. The app icons are in `pwa/` (`icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`).
- **Voice:** plain, short and friendly, written for players rather than gamers. Say what something does in everyday words.
- **Kid-friendly tone:** playful and gentle. Nothing grim or gory.

## Evidence on Hand

- The live game, its in-game Bestiary and its Hall of Heroes scores are the only real content.
- There are no testimonials, press, player counts or reviews. Never invent them.

## Product Principles

1. **Keep it one file.** A feature that needs a dependency, a build step inside the game, or a network call for core play doesn't fit.
2. **Thumb first.** Design every interaction for a small touch screen first, then let it scale up.
3. **Every run should feel different.** New content should add variety to runs or depth across runs, not just bigger numbers.
4. **Plain words over jargon.** When the UI explains a rule, it uses everyday language a non-gamer understands on first read.
5. **Fair to compare.** Anything that changes difficulty respects `RULES_VERSION`, so scores on a board stay comparable.

## Accessibility & Inclusion

- Respects `prefers-reduced-motion`. Feedback that moves must have a non-motion equivalent.
- Important information is never carried by sound alone, or by colour alone.
