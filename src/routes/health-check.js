import pool from '../db/mysql.js';

export default async function healthCheck(req, res, next) {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
