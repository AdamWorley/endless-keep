# Endless Keep — improvement ideas

Ticked items are in the game. Rough order within each section is by value for effort.

## Planning and information
- [x] **Show exactly what's coming** — "Up next" lists the next level's real monsters with counts, plus the next boss and next new monster under "Later".
- [x] **Bestiary** — every monster and boss with health, speed, armour, gold, hearts lost, how many you've defeated, flavour and how to beat it. Unmet monsters are shadows. Open it from the start card, the Up next panel, or by tapping a monster's chip.
- [ ] **End-of-level summary** — gold earned, castle hits, top tower, trees that grew.
- [ ] **First-game coach** — 3–4 one-time tips at the right moment ("Bats incoming: catapults can't hit them").

## Gameplay
- [x] **Trees as lookouts** — each grown tree near a tower gives it +5% range, up to +15%. Saplings count once they grow.
- [ ] **Late-game variety** — elite monsters (gold outline + one trait: shielded, regenerating, swift, splits on death) and a level modifier every 5 levels ("Fog: −20% range", "Stampede: riders only", "Bounty: double gold").
- [ ] **More bosses** — only three exist, so they repeat every 30 levels.
- [ ] **Tower specialisations at level 5** — pick one of two branches (Archer: Longbow or Volley; Catapult: Boulder stun or Fire pot burn).
- [ ] **Riders dismount** — when the wolf dies the goblin/orc carries on, slower, on foot.
- [ ] **Early start bonus** — a little gold for starting the next level before the countdown ends.
- [ ] **Targeting modes** — First / Strongest / Closest / Flying first per tower.
- [ ] **Daily challenge** — same seed for everyone each day, with its own Hall of Heroes.

- [x] **Heirlooms (meta progression)** — earn picks by reaching level 5 and every 10 levels; choose 1 of 3 permanent heirlooms (Common / Rare / Epic / Legendary) that apply to every future game.
- [x] **Export / import** — a code or file with your heirlooms and saved game, to move between devices or between the app and the Claude page.
- [x] **Random events** — some levels bring Fog, Tailwind, Scrap armour, Horde, Stampede, Thunderstorm, Gold rush, or a choice (Goblin toll, Wandering wizard). More heirlooms = more frequent and more often bad.
- [x] **Dynasties (prestige)** — give up all heirlooms (15 + 5 per rank needed) to raise House rank for good: +5% tower damage and gold per rank, rarer heirloom offers, a few more events.
- [ ] **Heirloom ideas to add later** — rerolls, a "banish" option, heirlooms that change rules (e.g. towers on the road edge, a second castle path).

## Two players
- [x] **Keeper vs Dark Lord (online)** — the Keeper hosts, the Dark Lord joins with a 5-letter code (PeerJS matchmaking, then direct connection). Dark Lord spends dread on a secret army each level, summons reinforcements and casts Tailwind / Scrap armour / Fog / Dark mending mid-level. Match length 10/20/30 levels.
- [ ] **Two-player ideas** — rematch button, let either side host, Dark Lord-only monsters/bosses, spectators, a chat/emote wheel.

## Leaderboard
- [x] **Shared Hall of Heroes for the installed app** — portable server in `leaderboard/` (Cloudflare Worker + D1 first), profanity filter, XSS/injection-safe, rate limited.
- [x] **Versioned boards** — `RULES_VERSION` in the game; bump it on any balance change and scores go to a fresh board (older boards stay viewable).
- [x] **Harder to fake scores** — signed run tickets, a minimum time per level, and an optional Turnstile bot check when a run starts.
- [ ] **Separate boards for heirloom-free runs** — heirlooms and dynasty ranks make runs easier; a "pure" board could keep those apart.

## Feel and UI
- [ ] **Clearer castle hits** — red flash at the gate and a short vibration on phones; easy to miss at 3× speed.
- [ ] **Undo during build** — full refund for a tower placed this build phase.
- [ ] **Install button in the PWA build** — catch the browser's install prompt and offer it on the start card.

## Done earlier
- Tower roles and "Best against", seasonal outfits, per-monster variety, redesigned monsters, mounted riders,
  castle fortifications (archers, moat, masons), treasury paid per level, saplings, softer difficulty after level 60,
  steady top buttons, PWA build (`pwa/build.sh` → `dist/`).
