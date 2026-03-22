import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM galeria_temas ORDER BY nome ASC');
    res.json(rows);
  } catch (error) {
    logger.error('GaleriaTemas GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { id, nome, descricao } = req.body;
    const now = new Date();
    await pool.execute(
      'INSERT INTO galeria_temas (id, nome, descricao, created, updated) VALUES (?, ?, ?, ?, ?)',
      [id, nome, descricao, now, now]
    );
    res.status(201).json({ message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('GaleriaTemas POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    await pool.execute(
      'UPDATE galeria_temas SET nome=?, descricao=?, updated=? WHERE id=?',
      [nome, descricao, new Date(), req.params.id]
    );
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('GaleriaTemas PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.execute('DELETE FROM galeria_temas WHERE id=?', [req.params.id]);
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('GaleriaTemas DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
