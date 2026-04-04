import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /api/faq — público
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM faq WHERE ativo = 1 ORDER BY ordem ASC, created ASC'
    );
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(rows);
  } catch (error) {
    logger.error('FAQ GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/faq/all — admin (inclui inativos)
router.get('/all', authMiddleware, checkPermission('dashboard', 'read'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM faq ORDER BY ordem ASC, created ASC');
    res.json(rows);
  } catch (error) {
    logger.error('FAQ GET all error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/faq
router.post('/', authMiddleware, checkPermission('dashboard', 'read'), async (req, res) => {
  try {
    const { pergunta, resposta, ordem = 0, ativo = 1 } = req.body;

    if (!pergunta || !resposta) {
      return res.status(400).json({ error: 'pergunta e resposta são obrigatórios' });
    }

    const id  = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO faq (id, pergunta, resposta, ordem, ativo, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, pergunta, resposta, Number(ordem), Number(ativo), now, now]
    );

    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('FAQ POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/faq/:id
router.put('/:id', authMiddleware, checkPermission('dashboard', 'read'), async (req, res) => {
  try {
    const { pergunta, resposta, ordem = 0, ativo = 1 } = req.body;

    if (!pergunta || !resposta) {
      return res.status(400).json({ error: 'pergunta e resposta são obrigatórios' });
    }

    const [result] = await pool.execute(
      'UPDATE faq SET pergunta=?, resposta=?, ordem=?, ativo=?, updated=? WHERE id=?',
      [pergunta, resposta, Number(ordem), Number(ativo), new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'FAQ não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('FAQ PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/faq/:id
router.delete('/:id', authMiddleware, checkPermission('dashboard', 'read'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM faq WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'FAQ não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('FAQ DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
