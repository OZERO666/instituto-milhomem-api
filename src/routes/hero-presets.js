import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

const ensureTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS hero_presets (
      id VARCHAR(36) PRIMARY KEY,
      nome TEXT,
      titulo TEXT,
      subtitulo TEXT,
      cta_texto TEXT,
      cta_link TEXT,
      badge TEXT,
      created_at DATETIME,
      updated_at DATETIME
    )
  `);
};

router.get('/', async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM hero_presets ORDER BY created_at DESC');
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    logger.error('HeroPresets GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, checkPermission('dashboard', 'create'), async (req, res) => {
  try {
    await ensureTable();
    const { nome, titulo, subtitulo, cta_texto, cta_link, badge } = req.body;
    const id = uuidv4();
    const now = new Date();
    await pool.execute(
      `INSERT INTO hero_presets (id, nome, titulo, subtitulo, cta_texto, cta_link, badge, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, nome || null, titulo || null, subtitulo || null, cta_texto || null, cta_link || null, badge || null, now, now],
    );
    const [rows] = await pool.execute('SELECT * FROM hero_presets WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    logger.error('HeroPresets POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, checkPermission('dashboard', 'update'), async (req, res) => {
  try {
    await ensureTable();
    const { nome, titulo, subtitulo, cta_texto, cta_link, badge } = req.body;
    const id = req.params.id;
    const now = new Date();
    const [result] = await pool.execute(
      `UPDATE hero_presets SET nome = ?, titulo = ?, subtitulo = ?, cta_texto = ?, cta_link = ?, badge = ?, updated_at = ? WHERE id = ?`,
      [nome || null, titulo || null, subtitulo || null, cta_texto || null, cta_link || null, badge || null, now, id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Preset não encontrado' });
    }
    const [rows] = await pool.execute('SELECT * FROM hero_presets WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    logger.error('HeroPresets PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('dashboard', 'delete'), async (req, res) => {
  try {
    await ensureTable();
    const [result] = await pool.execute('DELETE FROM hero_presets WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Preset não encontrado' });
    }
    res.json({ message: 'Preset excluído com sucesso' });
  } catch (error) {
    logger.error('HeroPresets DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
