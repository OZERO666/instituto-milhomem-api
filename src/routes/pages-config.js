import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const ensureTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pages_config (
      id VARCHAR(36) PRIMARY KEY,
      page_key VARCHAR(64) NOT NULL UNIQUE,
      data JSON,
      created DATETIME,
      updated DATETIME
    )
  `);
};

const parseData = (raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

router.get('/', async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM pages_config ORDER BY page_key ASC');
    const data = rows.map((row) => ({
      id: row.id,
      page_key: row.page_key,
      ...parseData(row.data),
    }));
    return res.json(data);
  } catch (error) {
    logger.error('PagesConfig GET list error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:pageKey', async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM pages_config WHERE page_key = ? LIMIT 1', [req.params.pageKey]);
    const row = rows[0];
    if (!row) return res.json({});
    return res.json({
      id: row.id,
      page_key: row.page_key,
      ...parseData(row.data),
    });
  } catch (error) {
    logger.error('PagesConfig GET by key error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:pageKey', authMiddleware, async (req, res) => {
  try {
    await ensureTable();

    const pageKey = req.params.pageKey;
    if (!pageKey) return res.status(400).json({ error: 'pageKey é obrigatório' });

    const dataPayload = { ...req.body };
    delete dataPayload.id;
    delete dataPayload.page_key;

    const now = new Date();
    const [existingRows] = await pool.execute('SELECT id FROM pages_config WHERE page_key = ? LIMIT 1', [pageKey]);

    let id = existingRows[0]?.id;
    if (id) {
      await pool.execute(
        'UPDATE pages_config SET data = ?, updated = ? WHERE id = ?',
        [JSON.stringify(dataPayload), now, id],
      );
    } else {
      id = uuidv4();
      await pool.execute(
        'INSERT INTO pages_config (id, page_key, data, created, updated) VALUES (?, ?, ?, ?, ?)',
        [id, pageKey, JSON.stringify(dataPayload), now, now],
      );
    }

    return res.json({ id, page_key: pageKey, ...dataPayload });
  } catch (error) {
    logger.error('PagesConfig PUT upsert error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;