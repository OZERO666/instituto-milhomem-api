import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const FIELDS = [
  'hero_title', 'hero_subtitle', 'hero_image', 'hero_badge',
  'doctor_name', 'doctor_title', 'doctor_image', 'doctor_bio', 'doctor_experience_number', 'doctor_experience_label',
  'about_title', 'about_text', 'about_detail_text', 'about_image',
  'wfi_badge', 'wfi_title', 'wfi_text', 'wfi_link',
  'values_title', 'values_subtitle',
  'team_title', 'team_subtitle',
  'technology_title', 'technology_text', 'technology_image',
];
const JSON_FIELDS = ['`values`', '`team`', 'doctor_credentials'];

const ensureTable = async () => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sobre_config (
      id VARCHAR(36) PRIMARY KEY,
      hero_title TEXT,
      hero_subtitle TEXT,
      hero_image TEXT,
      hero_badge TEXT,
      doctor_name TEXT,
      doctor_title TEXT,
      doctor_image TEXT,
      doctor_bio TEXT,
      doctor_credentials JSON,
      doctor_experience_number TEXT,
      doctor_experience_label TEXT,
      about_title TEXT,
      about_text TEXT,
      about_detail_text TEXT,
      about_image TEXT,
      wfi_badge TEXT,
      wfi_title TEXT,
      wfi_text TEXT,
      wfi_link TEXT,
      values_title TEXT,
      values_subtitle TEXT,
      \`values\` JSON,
      team_title TEXT,
      team_subtitle TEXT,
      \`team\` JSON,
      technology_title TEXT,
      technology_text TEXT,
      technology_image TEXT,
      created DATETIME,
      updated DATETIME
    )
  `);

  // Add new columns to existing tables (safe — ignores if already exists)
  const newCols = [
    ['hero_badge', 'TEXT'], ['doctor_name', 'TEXT'], ['doctor_title', 'TEXT'],
    ['doctor_image', 'TEXT'], ['doctor_bio', 'TEXT'], ['doctor_credentials', 'JSON'],
    ['doctor_experience_number', 'TEXT'], ['doctor_experience_label', 'TEXT'],
    ['about_detail_text', 'TEXT'], ['wfi_badge', 'TEXT'], ['wfi_title', 'TEXT'],
    ['wfi_text', 'TEXT'], ['wfi_link', 'TEXT'], ['values_title', 'TEXT'],
    ['values_subtitle', 'TEXT'], ['team_title', 'TEXT'], ['team_subtitle', 'TEXT'],
  ];
  for (const [col, type] of newCols) {
    try {
      await pool.execute(`ALTER TABLE sobre_config ADD COLUMN \`${col}\` ${type}`);
    } catch {
      // column already exists – ignore
    }
  }
};

const pick = (body) => {
  const data = {};
  for (const f of FIELDS) data[f] = body[f] || null;
  data.values = JSON.stringify(body.values || []);
  data.team = JSON.stringify(body.team || []);
  data.doctor_credentials = JSON.stringify(body.doctor_credentials || []);
  return data;
};

router.get('/', async (req, res) => {
  try {
    await ensureTable();
    const [rows] = await pool.execute('SELECT * FROM sobre_config LIMIT 1');
    return res.json(rows[0] || {});
  } catch (error) {
    logger.error('SobreConfig GET error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    await ensureTable();

    const [existing] = await pool.execute('SELECT id FROM sobre_config LIMIT 1');
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe uma configuração Sobre. Use PUT para atualizar.' });
    }

    const id = uuidv4();
    const now = new Date();
    const data = pick(req.body);

    const cols = [...FIELDS, ...JSON_FIELDS, 'id', 'created', 'updated'];
    const placeholders = cols.map(() => '?').join(', ');
    const vals = [
      ...FIELDS.map(f => data[f]),
      data.values, data.team, data.doctor_credentials,
      id, now, now,
    ];

    await pool.execute(
      `INSERT INTO sobre_config (${cols.join(', ')}) VALUES (${placeholders})`,
      vals,
    );

    const [rows] = await pool.execute('SELECT * FROM sobre_config WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    logger.error('SobreConfig POST error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const data = pick(req.body);

    const setClauses = [
      ...FIELDS.map(f => `\`${f}\` = ?`),
      ...JSON_FIELDS.map(f => `${f} = ?`),
      'updated = ?',
    ];
    const vals = [
      ...FIELDS.map(f => data[f]),
      data.values, data.team, data.doctor_credentials,
      new Date(),
      req.params.id,
    ];

    const [result] = await pool.execute(
      `UPDATE sobre_config SET ${setClauses.join(', ')} WHERE id = ?`,
      vals,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Configuração Sobre não encontrada' });
    }

    const [rows] = await pool.execute('SELECT * FROM sobre_config WHERE id = ?', [req.params.id]);
    return res.json(rows[0]);
  } catch (error) {
    logger.error('SobreConfig PUT error:', error.message);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
