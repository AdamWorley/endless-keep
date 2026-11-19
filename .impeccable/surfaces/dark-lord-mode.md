---
version: 1
slug: "dark-lord-mode"
primary_target: "dark-lord-mode"
related_targets: ["endless-keep.html"]
---

# Dark Lord mode relaunch

Status: brief confirmed 2026-11-19 (shape). No direction contract or code yet. Two-player mode stays switched off (`VERSUS_ON = false`) until the balance gate below passes.

Build order: (1) live-match rules and a bot Dark Lord in `bot/`; (2) prove balance; (3) both players' screens through new-work, which writes the direction contract here.

## Job and audience

Two people who know each other (family, often a kid on one side), each on their own phone, in a timed match. Visitor mode: **Operate** for both sides. The Keeper knows the solo game; the Dark Lord may be playing for the first time.

## Outcome and proof

- **Goal:** neither player ever waits. The Dark Lord always has a move to make; the Keeper can see a rival acting on the board.
- **Balance gate:** a bot Dark Lord beats the evolved Keeper strategies (`bot/strategies`) 40–60% of the time at every match length, and every match reaches night (Lanterns, fog). Only then does `VERSUS_ON` go back to true.
- **Product truth:** the Dark Lord feeds on every castle hit, and the Keeper's whole kit (Lanterns, trees, seasons) is played against a thinking opponent, not a planned wave.

## Direction

- **Pacing: one match clock**, replacing levels. Lengths 8 / 15 / 25 minutes. The five seasons split the clock evenly, so every match ends at night. A hidden tide counter maps elapsed time onto the existing per-level scaling (unlocks, health, spell costs). Each season change hands the Dark Lord one boss to play. No Ready button, no plan-then-wait phase.
- **Sending: Gates and cooldowns** (after Plants vs Zombies Versus and Left 4 Dead Versus). Dread drips in steadily, grows each season, and still pays out on castle hits. The Dark Lord's tray mirrors the Keeper's tokens: each monster has a dread cost and a recharge. Tap a monster, then a gate; tapping a monster twice sends it from the last gate used. The four existing spells (Tailwind, Scrap armour, Fog, Dark mending) move into the tray with cooldowns.
- **Dark Gates:** up to 3, raised for dread on allowed spots beside the road. Each is a spawn point and adds to the drip. Gates are violet pieces on the board; the Keeper's towers can damage them, and knocking one down pays the Keeper gold.
- **Scouting is a move.** Neither side sees the other's money by default (the Dark Lord loses today's gold chip). Keeper's **Spyglass** (gold): shows the Dark Lord's dread and which monsters are ready, for a few seconds. Dark Lord's **Raven** (dread): shows the Keeper's gold and the stretch of road where the Keeper's damage is thinnest.
- **Disconnects:** if the Dark Lord leaves, the bot Dark Lord takes over and both players are told.
- **Proposed look, to settle in new-work:** "the other side of the same table". Same board-game box, seen from across the table: violet tray and pieces, a darker night-tablecloth background on the Dark Lord's phone only. Mischievous and kid-friendly, never grim. This is an exception to DESIGN.md's light-only rule (the user is open to it), so DESIGN.md gets a written exception for the Dark Lord's screen only, recorded at finish.

## Scope and boundaries

- **In scope:** live-mode rules; both players' screens during a match; the lobby's match-length choice; the end card with Rematch and Swap sides; the bot Dark Lord.
- **Untouched:** solo rules and `RULES_VERSION` (live-mode rules stay separate); Hall of Heroes (no versus scores); heirlooms stay at home; the Keeper's build controls.
- **Anti-goals:** any Ready button or screen where one player waits on the other; the Dark Lord's side reading as a price list; gold used for anything but the next move.

## States and ranges

Lobby (host, join, length); match-start countdown on both phones; normal play; gate raised; gate destroyed; season change with boss card; scout active; last minute; pause (limited); opponent dropped (bot takes over); reconnect; win and loss on both phones. The tray grows from 3–4 monsters in spring to the full roster plus spells and the Gate at night, and must hold the maximum without anything moving or resizing.

## Interaction and layout

- **Keeper:** the board leads. Score track: match clock (replaces Level), gold, castle. A short live feed of the rival's moves ("The Dark Lord raised a gate", "cast Fog"), since players often have sound off. A violet ripple at a gate a beat before a spawn; a static mark under reduced motion. Spyglass in the controls.
- **Dark Lord:** the board leads. Score track: clock, dread with its rate (e.g. +6/s), castle. Tray holds monsters, spells and the Gate; recharge shows as a ring plus a seconds number (not motion alone). Picking a monster lights up the gates. Side card: Raven, boss card, a one-line first-timer hint.
- **Both:** no speed control (1×), thumb-first, tray goes vertical in short landscape as the Keeper's does now. Violet cues also carry a shape or label, never colour alone.

## Constraints and open decisions

- **Constraints:** one file, no dependencies. Network model unchanged: the Keeper's device runs the game and sends snapshots; cooldowns and gate rules run on the Keeper's device, and the Dark Lord's screen only displays them. Phone performance with 3 gates on a full night board.
- **Settle with the bot harness, don't guess:** dread drip and growth, cooldown lengths, gate cost / health / payout, the Keeper's gold drip, scouting costs and durations, pause limits.
- **Open for the user:** how the tray holds the full night roster on a phone (scrolling row or two pages); whether Swap sides ships in the first release.
