# Endless Keep — improvement ideas

Ticked items are in the game. Rough order within each section is by value for effort.

## Planning and information
- [x] **Show exactly what's coming** — "Up next" lists the next level's real monsters with counts, plus the next boss and next new monster under "Later".
- [x] **Bestiary** — every monster and boss with health, speed, armour, gold, hearts lost, how many you've defeated, flavour and how to beat it. Unmet monsters are shadows. Open it from the start card, the Up next panel, or by tapping a monster's chip.
- [ ] **End-of-level summary** — gold earned, castle hits, top tower, trees that grew.
- [ ] **First-game coach** — 3–4 one-time tips at the right moment ("Bats incoming: catapults can't hit them").

## Gameplay
- [x] **The wishing fish (rules v5)** — now and then (about one level in four, from level 3; not in winter or while a wish is working) a golden fish surfaces in the pond for 8 seconds. Tap it, or press W, and choose one of three wishes: an heirloom's bonus (e.g. Sharp arrows ×3, Volley drills ×1) for the rest of that level and the next 5. It runs on real time outside the game's update, so it's as easy to catch at 3× and bots never meet it. Achievement: Wishful Thinking.
- [x] **Trees as lookouts** — each grown tree near a tower gives it +5% range, up to +15%. Saplings count once they grow.
- [x] **Seasons change the rules (rules v4)** — Spring: saplings grow twice as fast. Summer: no change. Autumn: chopped trees give 50% more gold. Winter: monsters on foot 15% slower, towers −10% range, Frost Spire chills last 50% longer. Night: towers −15% range unless lit. Up next warns a level ahead. Older saved games keep their old rules.
- [x] **Lantern (rules v4)** — a cheap support post that doesn't attack. Towers in its light ignore darkness and fog, and monsters in it take +10% damage (+2% per upgrade, up to +30%). The brightest light wins; lights don't add up. Not needed for "Every Banner Flies".
- [x] **Trolls a little easier (rules v4)** — health 6.5 → 6.2 and healing 2% → 1.5% a second. Players found them a wall from level 16, repairing the castle just to keep up. Bot tests put the ceiling at about the same place (123 → 125 levels on average), so it mostly helps the early encounters. Older saved games keep the old troll.
- [x] **Square grid (rules v4)** — the board is 24 × 14 squares of 40. The road runs through the middle of a line of squares, one square wide, and a tower, sapling or tree fills one square. Older saves move each tower to the nearest free square (or refund it). Bots: 125.5 → 121.8 levels on average.
- [x] **Map builder** — Maps on the start screen: pick a map for the next new game, or build one by painting road squares. Every road that ends at the edge is a way in; monsters on foot take turns between the routes to the gate (up to 6). Roads are one square wide. Maps stay on the device; games on them skip the shared leaderboard and personal bests. Two-player games always use Meadow road.
- [x] **Archers grow up (rules v5)** — Archer Towers cost 40 instead of 50 (upgrades 20% cheaper too) and become Longbow Towers at level 5 (+20% range, armour blunts arrows less: ×1.3 instead of ×1.6) and Dragon Ballistas at level 10 (+25% range, ×1.6 damage at ×0.65 rate, armour counts normally, +50% damage to fliers). Each tier has its own look; the ballista turns to aim and fires heavy bolts. Castle archers stay plain archers. Older saved games keep plain archers.
- [x] **Castle mages (rules v5)** — a fortification like the castle archers: level n casts like a level n + 3 Mage Tower with 300 range from the keep, for double the archers' price. Can't be hexed. Bots (untrained on them) spend on them and drop 121.8 → 118.5; with mages ignored they hold exactly as before, since the evolved strategy builds no Archer Towers.
- [x] **Upgrades pay (rules v5)** — bot tests (bans of each tower) showed only frost and catapults earning their place, with every strategy carpeting the map in ~200 low-level towers, because a level added 50% damage for 55% more cost. Now a level adds 55% damage, so an upgrade is worth as much per gold as a new tower and saves a spot. Monsters gain 0.35% health a level to match (the bot held 120.4 → 120.7: difficulty unchanged; at ×1.6 it was 147.6). Mages hit 25% harder (32 → 40). Dragon upgrades are priced as if the roost cost 200, not 350.
- [x] **Masons toned down (rules v5)** — each mason patches 1 heart a level instead of 2 (five used to take the walls from half to full every level), and the castle starts with 30 hearts instead of 20. Bots: 118.5 → 118.3 levels on average, so about even overall.
- [x] **Slime Cube and slimes (rules v5)** — a fifth boss at level 50 (then every 50 levels): a wobbling jelly cube with a skull, a sword and a coin inside. It heals (1% a second) and bursts into 4 slimes; every slime (4 health, 3 hearts, heals 1.5% a second) bursts into a swarm of 8-12 slimelets, each about an orc without the armour (2.6 health, 2 hearts) that heals too. Slimes join normal waves from level 51 and are the late game's wall (bot: 119.8 → 113.8 levels, slimelets the commonest monster on the road at the end). Splash towers shine. The Troll King now comes every 50 levels instead of 40. Older saved games keep four bosses and no slimes.
- [x] **Lauren and a chocolate Cinder** — Lauren is the ninth special dragon name (+40% fire splash, rules v5 games only). Cinder is now chocolate brown.
- [ ] **Late-game variety** — elite monsters (gold outline + one trait: shielded, regenerating, swift, splits on death) and a level modifier every 5 levels ("Fog: −20% range", "Stampede: riders only", "Bounty: double gold").
- [x] **Five bosses** — Troll King (10), Elder Dragon (20), Bone Wyrm (30), Jasmine the Witch (40) and the Slime Cube (50, rules v5), then round again every 50 levels. Five is enough.
- [x] **Bosses come back changed (rules v5)** — from level 60, each boss returns as a second form with one new trick, and brings an escort of its own kind (4, then 2 more each time round, up to 12) ahead of it: the Iron Troll King (heavy armour, heals; trolls), the Elder Dragons (a pair, each 60% health; wyverns), the Undying Wyrm (pulls itself back together once at half health; skeleton knights), Jasmine, Queen of Hexes (hexes twice as often; bats) and the Great Slime Cube (bursts into 6 slimes; slimes). A returning boss glows in its own colour, and the bestiary describes its second form. Bots: about even (111.7 → 113.1).
- [ ] **Tower specialisations at level 5** — pick one of two branches (Archer: Longbow or Volley; Catapult: Boulder stun or Fire pot burn).
- [ ] **Riders dismount** — when the wolf dies the goblin/orc carries on, slower, on foot.
- [ ] **Early start bonus** — a little gold for starting the next level before the countdown ends.
- [ ] **Targeting modes** — First / Strongest / Closest / Flying first per tower.
- [ ] **Daily challenge** — same seed for everyone each day, with its own Hall of Heroes.

- [x] **Heirlooms (meta progression)** — earn picks at levels 5, 15, 30, 50, 75… in one game (each gap 5 levels longer than the last; rules v3); choose 1 of 3 permanent heirlooms (Common / Rare / Epic / Legendary) that apply to every future game.
- [x] **Export / import** — a code or file with your heirlooms and saved game, to move between devices or between the app and the Claude page.
- [x] **Tower roles (rules v3)** — archers fire fast but armour blunts arrows; mages pierce armour one target at a time; catapults are slow and heavy with a wide splash and a blind spot up close; monsters get tougher faster after level 50.
- [x] **Jasmine the Witch (boss, level 40)** — flies on a broomstick and hexes the towers that hurt her (silenced for 2 seconds). Spreading damage across many towers beats her.
- [x] **Castle archers match Archer Towers** — level n shoots like a level n + 3 Archer Tower (same heirlooms, same armour weakness) with 300 range from the battlements, for the price of a level n + 2 one, since they only see what gets past your towers; Jasmine can't hex them.
- [x] **Fairer trees** — a woodcutter clears a tree at once and pays you the firewood minus a fee (50%, less with Lumber rights); a Chop button and bigger touch targets make chopping by hand easy on phones.
- [x] **Selling asks first** — Sell shows "Yes, sell" and "Keep it".
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
- [x] **Clearer castle hits** — the gate flashes, the Castle counter jolts and turns to "Low!" below a third, heavy blows redden the board's edges, phones buzz (Buzz toggle), and the Dark Lord sees "Your army got through!". Hits close together build into one cue.
- [ ] **Undo during build** — full refund for a tower placed this build phase.
- [ ] **Install button in the PWA build** — catch the browser's install prompt and offer it on the start card.

## Done earlier
- Tower roles and "Best against", seasonal outfits, per-monster variety, redesigned monsters, mounted riders,
  castle fortifications (archers, moat, masons), treasury paid per level, saplings, softer difficulty after level 60,
  steady top buttons, PWA build (`pwa/build.sh` → `dist/`).
