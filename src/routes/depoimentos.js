import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM depoimentos ORDER BY created DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Depoimentos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, cargo, mensagem, foto } = req.body;

    if (!nome || !mensagem) {
      return res.status(400).json({ error: 'nome e mensagem são obrigatórios' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO depoimentos (id, nome, cargo, mensagem, foto, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nome, cargo || null, mensagem, foto || null, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Depoimentos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, cargo, mensagem, foto } = req.body;

    if (!nome || !mensagem) {
      return res.status(400).json({ error: 'nome e mensagem são obrigatórios' });
    }

    const [result] = await pool.execute(
      'UPDATE depoimentos SET nome=?, cargo=?, mensagem=?, foto=?, updated=? WHERE id=?',
      [nome, cargo || null, mensagem, foto || null, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Depoimentos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM depoimentos WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Depoimento não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Depoimentos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
