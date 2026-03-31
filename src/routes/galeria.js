// src/routes/galeria.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /galeria — lista todas, opcionalmente filtra por tema_id
router.get('/', async (req, res) => {
  try {
    const { tema_id } = req.query;
    let query = `
      SELECT g.*, t.nome AS tema_nome
      FROM galeria g
      LEFT JOIN galeria_temas t ON t.id = g.tema_id
      ORDER BY g.created DESC
    `;
    const params = [];

    if (tema_id) {
      query = `
        SELECT g.*, t.nome AS tema_nome
        FROM galeria g
        LEFT JOIN galeria_temas t ON t.id = g.tema_id
        WHERE g.tema_id = ?
        ORDER BY g.created DESC
      `;
      params.push(tema_id);
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    logger.error('Galeria GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /galeria/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT g.*, t.nome AS tema_nome
       FROM galeria g
       LEFT JOIN galeria_temas t ON t.id = g.tema_id
       WHERE g.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    logger.error('Galeria GET/:id error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /galeria
router.post('/', authMiddleware, checkPermission('gallery', 'create'), async (req, res) => {
  try {
    const { titulo, tema_id, meses_pos_operatorio, foto_antes, foto_depois } = req.body;

    if (!titulo) return res.status(400).json({ error: 'titulo é obrigatório' });
    if (!foto_antes || !foto_depois) return res.status(400).json({ error: 'foto_antes e foto_depois são obrigatórios' });

    // Valida tema_id se fornecido
    if (tema_id) {
      const [temas] = await pool.execute('SELECT id FROM galeria_temas WHERE id = ?', [tema_id]);
      if (temas.length === 0) return res.status(400).json({ error: 'tema_id inválido' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      `INSERT INTO galeria (id, titulo, tema_id, meses_pos_operatorio, foto_antes, foto_depois, created, updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, titulo, tema_id || null, meses_pos_operatorio || null, foto_antes, foto_depois, now, now]
    );

    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Galeria POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /galeria/:id
router.put('/:id', authMiddleware, checkPermission('gallery', 'update'), async (req, res) => {
  try {
    const { titulo, tema_id, meses_pos_operatorio, foto_antes, foto_depois } = req.body;

    if (!titulo) return res.status(400).json({ error: 'titulo é obrigatório' });

    // Valida tema_id se fornecido
    if (tema_id) {
      const [temas] = await pool.execute('SELECT id FROM galeria_temas WHERE id = ?', [tema_id]);
      if (temas.length === 0) return res.status(400).json({ error: 'tema_id inválido' });
    }

    // Busca registro atual para manter fotos se não enviadas
    const [current] = await pool.execute(
      'SELECT foto_antes, foto_depois FROM galeria WHERE id = ?',
      [req.params.id]
    );
    if (current.length === 0) return res.status(404).json({ error: 'Item não encontrado' });

    const finalFotoAntes  = foto_antes  || current[0].foto_antes;
    const finalFotoDepois = foto_depois || current[0].foto_depois;

    const [result] = await pool.execute(
      `UPDATE galeria
       SET titulo = ?, tema_id = ?, meses_pos_operatorio = ?, foto_antes = ?, foto_depois = ?, updated = ?
       WHERE id = ?`,
      [titulo, tema_id || null, meses_pos_operatorio || null, finalFotoAntes, finalFotoDepois, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Galeria PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /galeria/:id
router.delete('/:id', authMiddleware, checkPermission('gallery', 'delete'), async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM galeria WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item não encontrado' });
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Galeria DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;