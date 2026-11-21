// Storage adapter for Cloudflare D1 (SQLite). The same SQL works with Turso/libSQL and Bun/Node SQLite.
// For Postgres, swap max(a, b) for GREATEST(a, b) and the ? placeholders for $1, $2…
// Every query uses bound parameters: player input is never pasted into SQL text.
export function d1Store(db) {
  return {
    async top(limit, ver, map) {
      const { results } = await db.prepare("SELECT name, best, best_at, badges FROM players WHERE ver = ? AND map = ? AND best > 0 ORDER BY best DESC, best_at ASC LIMIT ?").bind(ver, map, limit).all();
      return results || [];
    },
    async versions() {
      const { results } = await db.prepare("SELECT ver, map, COUNT(*) AS players FROM players WHERE best > 0 GROUP BY ver, map ORDER BY ver DESC LIMIT 100").all();
      return results || [];
    },
    async get(id, ver, map) {
      return await db.prepare("SELECT id, ver, map, name, best, best_at, badges, updated FROM players WHERE id = ? AND ver = ? AND map = ?").bind(id, ver, map).first();
    },
    async put(p) {
      await db.prepare(
        "INSERT INTO players (id, ver, map, name, best, best_at, badges, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(id, ver, map) DO UPDATE SET name = excluded.name, best = max(players.best, excluded.best), " +
        // decided in SQL, not from the row read earlier, so two saves at once can't stamp a lower score's time on the best
        "best_at = CASE WHEN excluded.best > players.best THEN excluded.best_at ELSE players.best_at END, badges = excluded.badges, updated = excluded.updated"
      ).bind(p.id, p.ver, p.map, p.name, p.best, p.best_at, p.badges, p.updated).run();
    },
    async hit(key, window) {
      const row = await db.prepare(
        "INSERT INTO hits (key, win, n) VALUES (?, ?, 1) ON CONFLICT(key, win) DO UPDATE SET n = n + 1 RETURNING n"
      ).bind(key, window).first();
      return row ? row.n : 1;
    },
    async prune(beforeWindow) {
      await db.prepare("DELETE FROM hits WHERE win < ?").bind(beforeWindow).run();
    },
  };
}
