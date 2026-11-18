# Endless Keep bots

Bots that play Endless Keep, evolved rather than hand-written, for testing balance changes.

They play the real game: `sim.mjs` loads `endless-keep.html` into Node with stand-ins for the browser (no
drawing, no sound, no network) and seeded random numbers, then calls the game's own `update()`. There is no copy
of the rules to keep in step, so a balance change in the game reaches the bots straight away.

## Quick start

```sh
# evolve a strategy (saved to bot/strategies/all-rounder.json after every generation)
npm run bot:evolve -- --name all-rounder --gens 25

# a different style: a strategy that never builds Dragon Roosts
npm run bot:evolve -- --name no-dragons --ban dragon --gens 25

# play every saved strategy on 20 fixed seeds and report how far each gets
npm run bot:test

# before and after a balance change
npm run bot:test -- --games 50 --save before
#   ...change the game...
npm run bot:test -- --games 50 --compare before
```

## Watching a game

`npm run bot:replay` plays one game with a saved strategy and records it, about ten snapshots a second, to
`bot/replays/` (not committed). Open the game with `#replay` on the end of its address, either the built game at
<http://localhost:8420/#replay> or `endless-keep.html#replay` straight from disk, then choose the file or drop it on
the page. You get play and pause, speed (½× to 16×), a position slider, a jump to any recorded level, and the whole
game's level-by-level log beside the board (hearts lost, gold, towers, the level's event).

```sh
npm run bot:replay                                        # all-rounder, first test seed, the last 10 levels
npm run bot:replay -- --strategy no-frost --levels 40-60  # a level range
npm run bot:replay -- --seed 2000000007 --levels 50       # one level
npm run bot:replay -- --levels all                        # every level (tens of MB)
```

The snapshots are the same ones two-player mode sends the Dark Lord, so the replay draws exactly what the bot's game
held. Ten levels is about 5 MB. The seeds match `bot:test`'s (2000000000 upwards), so a game that falls early in a
test can be recorded and watched.

## What a strategy is

A strategy is about 45 numbers (genes, listed in `policy.mjs`). Between levels it:

- shares the gold it has earned between three pots (towers, castle, economy). The shares change between
  levels 1-15, 16-40 and 41+;
- spends the tower pot on the best new tower or upgrade per gold. Each tower type, and upgrading, has its
  own weight in each of those stages. It places towers where they cover the most road, leaning towards the
  start or the castle end as its genes say. It saves up for something better unless its patience runs out;
- spends the castle pot on walls, castle archers, the moat or masons, repairs below a set share of hearts, and
  opens or upgrades the treasury if it pays for itself quickly enough;
- plants and harvests saplings, chops trees by hand, and decides on tolls and wizards.

It builds only between levels, never mid-level, and plays with no heirlooms unless told to.

## Evolution

Every strategy in a generation plays the same seeds (`--seeds`, default 4). Fitness is the average number of
levels held, up to `--max-level` (default 150). The best few carry on unchanged. The rest are bred from
tournament winners and mutated. `--resume` carries on a run from `bot/runs/` (not committed). If a strategy
with the same name already exists, a new run starts from it.

Options: `--pop 40 --gens 25 --seeds 4 --elite 4 --mutate 0.15 --max-level 150 --ban dragon,lantern --rng 1`.

Games step at 1/30 of a second. The real game steps at about 1/60 (three times a frame at 3× speed), which is
close enough and twice as slow to run. A game of 80+ levels takes about 10 seconds. Runs use every core but one.

## Files

- `sim.mjs`: loads the game into a sandbox and exposes the game functions the bot needs.
- `policy.mjs`: the genes and what a strategy does with them.
- `play.mjs`: plays one game and reports the result.
- `evolve.mjs`, `pool.mjs`, `worker.mjs`: evolution, run across worker threads.
- `test.mjs`: the balance test. Results go to `bot/results/`.
- `strategies/`: evolved strategies, with a readable summary of each.
