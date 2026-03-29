import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contato_config LIMIT 1');
    res.json(rows[0] || {});
  } catch (error) {
    logger.error('ContatoConfig GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      email,
      telefone,
      whatsapp,
      instagram,
      facebook,
      mensagem_header,
      mensagem_whatsapp,
      endereco,
      dias_funcionamento,
      horario,
      latitude,
      longitude,
      zoom,
    } = req.body;

    const id = uuidv4(); // ← gerado pelo servidor
    const now = new Date();

    await pool.execute(
      'INSERT INTO contato_config (id, email, telefone, whatsapp, instagram, facebook, mensagem_header, mensagem_whatsapp, endereco, dias_funcionamento, horario, latitude, longitude, zoom, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        email || null,
        telefone || null,
        whatsapp || null,
        instagram || null,
        facebook || null,
        mensagem_header || null,
        mensagem_whatsapp || null,
        endereco || null,
        dias_funcionamento || null,
        horario || null,
        latitude || null,
        longitude || null,
        zoom ?? 17,
        now,
        now,
      ]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('ContatoConfig POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      email,
      telefone,
      whatsapp,
      instagram,
      facebook,
      mensagem_header,
      mensagem_whatsapp,
      endereco,
      dias_funcionamento,
      horario,
      latitude,
      longitude,
      zoom,
    } = req.body;

    const [result] = await pool.execute(
      'UPDATE contato_config SET email=?, telefone=?, whatsapp=?, instagram=?, facebook=?, mensagem_header=?, mensagem_whatsapp=?, endereco=?, dias_funcionamento=?, horario=?, latitude=?, longitude=?, zoom=?, updated=? WHERE id=?',
      [
        email || null,
        telefone || null,
        whatsapp || null,
        instagram || null,
        facebook || null,
        mensagem_header || null,
        mensagem_whatsapp || null,
        endereco || null,
        dias_funcionamento || null,
        horario || null,
        latitude || null,
        longitude || null,
        zoom ?? 17,
        new Date(),
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('ContatoConfig PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
