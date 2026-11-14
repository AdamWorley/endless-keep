-- Endless Keep shared leaderboard (SQLite / D1 / libSQL; also valid Postgres apart from nothing).
CREATE TABLE IF NOT EXISTS players (
  id      TEXT NOT NULL,             -- salted hash of the player's secret token
  ver     INTEGER NOT NULL CHECK (ver BETWEEN 1 AND 999),   -- the game's rules version (each has its own board)
  name    TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 64),
  best    INTEGER NOT NULL CHECK (best BETWEEN 0 AND 5000),
  best_at INTEGER NOT NULL,          -- when the best level was reached (ms)
  badges  TEXT NOT NULL DEFAULT '[]',
  updated INTEGER NOT NULL,
  PRIMARY KEY (id, ver)
);
CREATE INDEX IF NOT EXISTS players_rank ON players (ver, best DESC, best_at ASC);
CREATE TABLE IF NOT EXISTS hits (    -- per-minute request counts for rate limiting (hashed IPs only)
  key TEXT NOT NULL,
  win INTEGER NOT NULL,
  n   INTEGER NOT NULL,
  PRIMARY KEY (key, win)
);
