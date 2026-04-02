// src/routes/settings.js
import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// GET /settings — público, retorna objeto { key: value }
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );
    const settings = {};
    for (const row of rows) {
      settings[row.setting_key] = row.setting_value;
    }
    res.json(settings);
  } catch (err) {
    logger.error('GET /settings error:', err.message);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
});

// PUT /settings — protegido, aceita { settings: { key: value, ... } }
router.put('/', authMiddleware, async (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return res.status(400).json({ error: 'Campo "settings" deve ser um objeto' });
  }

  const entries = Object.entries(settings);
  if (entries.length === 0) {
    return res.status(400).json({ error: 'Nenhuma configuração enviada' });
  }

  try {
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
      );
    }

    // Retorna todas as settings atualizadas
    const [rows] = await pool.query(
      'SELECT setting_key, setting_value FROM site_settings'
    );
    const updated = {};
    for (const row of rows) updated[row.setting_key] = row.setting_value;

    res.json(updated);
  } catch (err) {
    logger.error('PUT /settings error:', err.message);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

export default router;
