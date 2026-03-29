// src/routes/hero-config.js
import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /hero-config
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hero_config ORDER BY id LIMIT 1'
    );
    if (!rows.length) return res.json(null);
    return res.json(rows[0]);
  } catch (err) {
    logger.error('GET /hero-config error', err.message);
    return res.status(500).json({ error: 'Erro ao buscar hero_config' });
  }
});

// POST /hero-config
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { badge, titulo, subtitulo, cta_texto, cta_link, imagem_fundo } = req.body;
    const now = new Date();

    const [result] = await pool.query(
      `INSERT INTO hero_config (badge, titulo, subtitulo, cta_texto, cta_link, imagem_fundo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        badge || null,
        titulo || null,
        subtitulo || null,
        cta_texto || null,
        cta_link || null,
        imagem_fundo || null,
        now,
        now,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM hero_config WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    logger.error('POST /hero-config error', err.message);
    return res.status(500).json({ error: 'Erro ao criar hero_config' });
  }
});

// PUT /hero-config/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { badge, titulo, subtitulo, cta_texto, cta_link, imagem_fundo } = req.body;

    const [result] = await pool.query(
      `UPDATE hero_config
         SET badge = ?, titulo = ?, subtitulo = ?, cta_texto = ?, cta_link = ?, imagem_fundo = ?, updated_at = ?
       WHERE id = ?`,
      [
        badge || null,
        titulo || null,
        subtitulo || null,
        cta_texto || null,
        cta_link || null,
        imagem_fundo || null,
        new Date(),
        id,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'hero_config não encontrado' });
    }

    const [rows] = await pool.query('SELECT * FROM hero_config WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    logger.error('PUT /hero-config/:id error', err.message);
    return res.status(500).json({ error: 'Erro ao atualizar hero_config' });
  }
});

export default router;