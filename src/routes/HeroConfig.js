// routes/heroConfig.js
import express from 'express';
import pool from '../db/mysql.js'; // caminho ajusta conforme sua estrutura

const router = express.Router();

// GET /hero-config  -> retorna o primeiro registro
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM hero_config ORDER BY id LIMIT 1'
    );
    if (!rows.length) return res.json(null);
    return res.json(rows[0]);
  } catch (err) {
    console.error('GET /hero-config error', err);
    return res.status(500).json({ error: 'Erro ao buscar hero_config' });
  }
});

// POST /hero-config -> cria um registro novo
router.post('/', async (req, res) => {
  try {
    const { badge, titulo, subtitulo, cta_texto, cta_link } = req.body;

    const [result] = await pool.query(
      `INSERT INTO hero_config (badge, titulo, subtitulo, cta_texto, cta_link)
       VALUES (?, ?, ?, ?, ?)`,
      [badge || null, titulo || null, subtitulo || null, cta_texto || null, cta_link || null]
    );

    const [rows] = await pool.query('SELECT * FROM hero_config WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /hero-config error', err);
    return res.status(500).json({ error: 'Erro ao criar hero_config' });
  }
});

// PUT /hero-config/:id -> atualiza um registro existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { badge, titulo, subtitulo, cta_texto, cta_link } = req.body;

    const [result] = await pool.query(
      `UPDATE hero_config
         SET badge = ?, titulo = ?, subtitulo = ?, cta_texto = ?, cta_link = ?
       WHERE id = ?`,
      [badge || null, titulo || null, subtitulo || null, cta_texto || null, cta_link || null, id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'hero_config não encontrado' });
    }

    const [rows] = await pool.query('SELECT * FROM hero_config WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('PUT /hero-config/:id error', err);
    return res.status(500).json({ error: 'Erro ao atualizar hero_config' });
  }
});

export default router;