import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM estatisticas LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    logger.error('Estatisticas GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { experiencia, pacientes, procedimentos, satisfacao } = req.body;

    // Só pode existir 1 registro — bloqueia duplicata
    const [existing] = await pool.execute('SELECT id FROM estatisticas LIMIT 1');
    if (existing.length > 0) {
      return res.status(409).json({
        error: 'Já existe um registro de estatísticas. Use PUT para atualizar.',
        id: existing[0].id,
      });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO estatisticas (id, experiencia, pacientes, procedimentos, satisfacao, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, experiencia ?? 0, pacientes ?? 0, procedimentos ?? 0, satisfacao ?? 0, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Estatisticas POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { experiencia, pacientes, procedimentos, satisfacao } = req.body;

    const [result] = await pool.execute(
      'UPDATE estatisticas SET experiencia=?, pacientes=?, procedimentos=?, satisfacao=?, updated=? WHERE id=?',
      [experiencia ?? 0, pacientes ?? 0, procedimentos ?? 0, satisfacao ?? 0, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Estatisticas PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
