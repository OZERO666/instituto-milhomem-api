import { Router } from 'express';
import pool from '../db/mysql.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Fetch active featured slots
    const query = `
      SELECT id, slot_name, slot_type, content_id, content_title, content_description, image_url, featured_order
      FROM featured_slots
      WHERE active = 1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY featured_order ASC
    `;
    const [rows] = await pool.execute(query);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(rows || []);
  } catch (error) {
    logger.error('Featured slots GET error:', error.message);
    res.status(500).json({ error: 'Erro ao buscar destaques' });
  }
});

router.get('/:slotName', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM featured_slots WHERE slot_name=? AND active=1 LIMIT 1',
      [req.params.slotName]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Slot não encontrado' });
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(rows[0]);
  } catch (error) {
    logger.error('Featured slot GET by name error:', error.message);
    res.status(500).json({ error: 'Erro ao buscar destaque' });
  }
});

export default router;
