import db from '../config/db.js';

// Writes an audit row for a mutation. Used by controllers INSIDE their transaction
// (pass the client) so the business change and its audit record commit or roll back together.
export const writeAudit = async (client, userId, action, details) => {
  await (client || db).query(
    'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
    [userId, action, details]
  );
};

// Request-level API logging for denied/failed mutations (complements transactional audit rows).
export const apiAuditLogger = (req, res, next) => {
  res.on('finish', () => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 400 && req.user) {
      db.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
        [req.user.id, 'DENIED_OR_FAILED', `${req.method} ${req.originalUrl} -> ${res.statusCode}`]).catch(() => {});
    }
  });
  next();
};
