import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const ACTION_TYPES_VALIDOS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const [rows] = await pool.execute(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (error) {
    logger.error('AuditLogs GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { action_type, collection_name, record_id, details } = req.body;

    // action_type validado por whitelist — nunca aceitar string arbitrária
    if (!action_type || !ACTION_TYPES_VALIDOS.includes(action_type)) {
      return res.status(400).json({
        error: `action_type inválido. Use: ${ACTION_TYPES_VALIDOS.join(', ')}`
      });
    }

    if (!collection_name) {
      return res.status(400).json({ error: 'collection_name é obrigatório' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO audit_logs (id, action_type, collection_name, record_id, user_id, details, timestamp, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, action_type, collection_name, record_id || null, req.user.id, details || null, now, now, now]
    );
    res.status(201).json({ id, message: 'Log registrado' });
  } catch (error) {
    logger.error('AuditLogs POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
