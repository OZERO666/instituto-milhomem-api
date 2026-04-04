// src/routes/servicos.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

// Lista todos os serviços
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM servicos ORDER BY ordem ASC');
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(rows);
  } catch (error) {
    logger.error('Servicos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Busca serviço por slug (para /servicos/:slug)
router.get('/slug/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM servicos WHERE slug = ? LIMIT 1',
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    res.json(rows[0]);
  } catch (error) {
    logger.error('Servicos GET slug error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cria serviço
router.post('/', authMiddleware, checkPermission('blog', 'create'), async (req, res) => {
  try {
    const {
      nome,
      slug,
      descricao,
      beneficios,
      processo,
      imagem,
      icon,
      ordem,
      conteudo,
    } = req.body;

    if (slug) {
      const [existing] = await pool.execute('SELECT id FROM servicos WHERE slug = ? LIMIT 1', [slug]);
      if (existing.length > 0) {
        return res.status(409).json({ error: `O slug "${slug}" já está em uso por outro serviço.` });
      }
    }
    const now = new Date();
    const id  = uuidv4();

    await pool.execute(
      'INSERT INTO servicos (id, nome, slug, descricao, beneficios, processo, imagem, icon, ordem, conteudo, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        nome || null,
        slug || null,
        descricao || null,
        beneficios || null,
        processo || null,
        imagem || null,
        icon || null,
        ordem ?? 0,
        conteudo || null,
        now,
        now,
      ]
    );

    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Servicos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor', code: error.code });
  }
});

// Atualiza serviço por id
router.put('/:id', authMiddleware, checkPermission('blog', 'update'), async (req, res) => {
  try {
    const {
      nome,
      slug,
      descricao,
      beneficios,
      processo,
      imagem,
      icon,
      ordem,
      conteudo,
    } = req.body;

    if (slug) {
      const [existing] = await pool.execute('SELECT id FROM servicos WHERE slug = ? AND id != ? LIMIT 1', [slug, req.params.id]);
      if (existing.length > 0) {
        return res.status(409).json({ error: `O slug "${slug}" já está em uso por outro serviço.` });
      }
    }

    const now = new Date();

    const [result] = await pool.execute(
      'UPDATE servicos SET nome=?, slug=?, descricao=?, beneficios=?, processo=?, imagem=?, icon=?, ordem=?, conteudo=?, updated=? WHERE id=?',
      [
        nome || null,
        slug || null,
        descricao || null,
        beneficios || null,
        processo || null,
        imagem || null,
        icon || null,
        ordem ?? 0,
        conteudo || null,
        now,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Servicos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor', code: error.code });
  }
});

// Deleta serviço
router.delete('/:id', authMiddleware, checkPermission('blog', 'delete'), async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM servicos WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Servicos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor', code: error.code });
  }
});

// Reordena serviços em lote
router.patch('/reorder', authMiddleware, checkPermission('blog', 'update'), async (req, res) => {
  try {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Array de itens esperado' });
    }
    const now = new Date();
    await Promise.all(
      items.map(({ id, ordem }) =>
        pool.execute('UPDATE servicos SET ordem=?, updated=? WHERE id=?', [ordem ?? 0, now, id])
      )
    );
    res.json({ message: 'Ordem atualizada' });
  } catch (error) {
    logger.error('Servicos PATCH reorder error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;