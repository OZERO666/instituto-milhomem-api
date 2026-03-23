import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const FILTROS_VALIDOS = ['Geral', 'Coroa', 'Entradas', 'Barba'];

router.get('/', async (req, res) => {
  try {
    const { filtro } = req.query;

    if (filtro && filtro !== 'Geral') {
      if (!FILTROS_VALIDOS.includes(filtro)) {
        return res.status(400).json({ error: 'Filtro inválido' });
      }
      const [rows] = await pool.execute(
        'SELECT * FROM galeria WHERE filtro=? ORDER BY created DESC',
        [filtro]
      );
      return res.json(rows);
    }

    const [rows] = await pool.execute('SELECT * FROM galeria ORDER BY created DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Galeria GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      titulo, descricao, filtro,
      foto_antes, foto_depois,
      meses_pos_operatorio, tema_id
    } = req.body;

    if (!foto_antes || !foto_depois) {
      return res.status(400).json({ error: 'foto_antes e foto_depois são obrigatórios' });
    }

    if (filtro && !FILTROS_VALIDOS.includes(filtro)) {
      return res.status(400).json({ error: 'Filtro inválido' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO galeria (id, titulo, descricao, filtro, foto_antes, foto_depois, meses_pos_operatorio, tema_id, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, titulo || null, descricao || null, filtro || 'Geral', foto_antes, foto_depois, meses_pos_operatorio ?? 0, tema_id || null, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Galeria POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      titulo, descricao, filtro,
      foto_antes, foto_depois,
      meses_pos_operatorio, tema_id
    } = req.body;

    if (filtro && !FILTROS_VALIDOS.includes(filtro)) {
      return res.status(400).json({ error: 'Filtro inválido' });
    }

    const [result] = await pool.execute(
      'UPDATE galeria SET titulo=?, descricao=?, filtro=?, foto_antes=?, foto_depois=?, meses_pos_operatorio=?, tema_id=?, updated=? WHERE id=?',
      [titulo || null, descricao || null, filtro || 'Geral', foto_antes || null, foto_depois || null, meses_pos_operatorio ?? 0, tema_id || null, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Galeria PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM galeria WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Galeria DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
