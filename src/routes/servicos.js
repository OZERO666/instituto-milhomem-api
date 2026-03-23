import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM servicos ORDER BY ordem ASC');
    res.json(rows);
  } catch (error) {
    logger.error('Servicos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao, beneficios, processo, imagem, ordem } = req.body;
    const now = new Date();
    const id = uuidv4(); // Gera ID automaticamente
    
    await pool.execute(
      'INSERT INTO servicos (id, nome, descricao, beneficios, processo, imagem, ordem, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nome, descricao, beneficios, processo, imagem, ordem || 0, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Servicos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, descricao, beneficios, processo, imagem, ordem } = req.body;
    const now = new Date();
    
    const [result] = await pool.execute(
      'UPDATE servicos SET nome=?, descricao=?, beneficios=?, processo=?, imagem=?, ordem=?, updated=? WHERE id=?',
      [nome, descricao, beneficios, processo, imagem, ordem || 0, now, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Servicos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM servicos WHERE id=?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Servicos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
