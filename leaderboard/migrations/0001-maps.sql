-- Per-map boards: adds the map column to players, with every existing score on the meadow.
-- SQLite can't change a primary key in place, so the table is rebuilt. Run once on each database, BEFORE deploying the
-- Worker that reads the map column:
--   npx wrangler d1 execute endless-keep-leaderboard --remote --file migrations/0001-maps.sql
--   npx wrangler d1 execute endless-keep-leaderboard-preview --remote --file migrations/0001-maps.sql
CREATE TABLE players_new (
  id      TEXT NOT NULL,
  ver     INTEGER NOT NULL CHECK (ver BETWEEN 1 AND 999),
  map     TEXT NOT NULL DEFAULT 'meadow' CHECK (length(map) BETWEEN 1 AND 16),
  name    TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 64),
  best    INTEGER NOT NULL CHECK (best BETWEEN 0 AND 5000),
  best_at INTEGER NOT NULL,
  badges  TEXT NOT NULL DEFAULT '[]',
  updated INTEGER NOT NULL,
  PRIMARY KEY (id, ver, map)
);
INSERT INTO players_new (id, ver, map, name, best, best_at, badges, updated)
  SELECT id, ver, 'meadow', name, best, best_at, badges, updated FROM players;
DROP TABLE players;
ALTER TABLE players_new RENAME TO players;
CREATE INDEX players_rank ON players (ver, map, best DESC, best_at ASC);
