import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ─── GET /traducoes/:tabela/:registroId?lang=en ──────────────────────────────
router.get('/:tabela/:registroId', async (req, res) => {
  const { tabela, registroId } = req.params;
  const { lang } = req.query;

  if (!lang || lang === 'pt' || lang.startsWith('pt-')) return res.json({});

  try {
    const [rows] = await pool.execute(
      'SELECT campo, valor FROM traducoes WHERE tabela = ? AND registro_id = ? AND locale = ?',
      [tabela, String(registroId), lang],
    );

    const result = {};
    for (const row of rows) result[row.campo] = row.valor;

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(result);
  } catch (err) {
    // Tabela pode não existir ainda — retorna vazio sem derrubar o servidor
    res.json({});
  }
});

// ─── GET /traducoes/:tabela?lang=en ─────────────────────────────────────────
router.get('/:tabela', async (req, res) => {
  const { tabela } = req.params;
  const { lang } = req.query;

  if (!lang || lang === 'pt' || lang.startsWith('pt-')) return res.json({});

  try {
    const [rows] = await pool.execute(
      'SELECT registro_id, campo, valor FROM traducoes WHERE tabela = ? AND locale = ?',
      [tabela, lang],
    );

    const result = {};
    for (const row of rows) {
      if (!result[row.registro_id]) result[row.registro_id] = {};
      result[row.registro_id][row.campo] = row.valor;
    }

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(result);
  } catch (err) {
    res.json({});
  }
});

// ─── POST /traducoes ─────────────────────────────────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
  const { tabela, registro_id, campo, locale, valor } = req.body;

  if (!tabela || !registro_id || !campo || !locale) {
    return res.status(400).json({ error: 'Campos obrigatórios: tabela, registro_id, campo, locale' });
  }

  if (locale === 'pt' || locale === 'pt-BR') {
    return res.status(400).json({ error: 'Use as tabelas originais para conteúdo em português' });
  }

  const ALLOWED_LOCALES = ['en', 'es'];
  if (!ALLOWED_LOCALES.includes(locale)) {
    return res.status(400).json({ error: `Locale não suportado: ${locale}` });
  }

  try {
    await pool.execute(
      `INSERT INTO traducoes (tabela, registro_id, campo, locale, valor)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE valor = VALUES(valor), updated_at = NOW()`,
      [tabela, String(registro_id), campo, locale, valor ?? null],
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar tradução. A tabela "traducoes" pode não existir ainda.' });
  }
});

export default router;
