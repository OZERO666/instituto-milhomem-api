import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', authMiddleware, checkPermission('leads', 'read'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM agendamentos ORDER BY created DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Agendamentos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { nome, email, telefone, tipo_servico, mensagem } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !email || !telefone) {
      return res.status(400).json({ error: 'nome, email e telefone são obrigatórios' });
    }

    // Validação básica de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }

    const id = uuidv4(); // ← gerado pelo servidor, não pelo cliente
    const now = new Date();

    await pool.execute(
      'INSERT INTO agendamentos (id, nome, email, telefone, tipo_servico, mensagem, lido, created, updated) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)',
      [id, nome, email, telefone, tipo_servico || null, mensagem || null, now, now]
    );

    logger.info(`Novo agendamento recebido: ${nome} (${email})`);
    res.status(201).json({ message: 'Agendamento recebido com sucesso' });
  } catch (error) {
    logger.error('Agendamentos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, checkPermission('leads', 'update'), async (req, res) => {
  try {
    const { lido } = req.body;

    const [result] = await pool.execute(
      'UPDATE agendamentos SET lido=?, updated=? WHERE id=?',
      [lido ? 1 : 0, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Agendamentos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('leads', 'delete'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM agendamentos WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Agendamentos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
