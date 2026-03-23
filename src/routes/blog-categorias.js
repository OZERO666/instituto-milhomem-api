import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM blog_categorias ORDER BY nome ASC');
    res.json(rows);
  } catch (error) {
    logger.error('BlogCategorias GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'nome é obrigatório' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO blog_categorias (id, nome, descricao, created, updated) VALUES (?, ?, ?, ?, ?)',
      [id, nome, descricao || null, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('BlogCategorias POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'nome é obrigatório' });
    }

    const [result] = await pool.execute(
      'UPDATE blog_categorias SET nome=?, descricao=?, updated=? WHERE id=?',
      [nome, descricao || null, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('BlogCategorias PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM blog_categorias WHERE id=?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('BlogCategorias DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
