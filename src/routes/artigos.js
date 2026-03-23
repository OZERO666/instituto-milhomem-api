import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM artigos ORDER BY data_publicacao DESC');
    res.json(rows);
  } catch (error) {
    logger.error('Artigos GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM artigos WHERE slug=?', [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Artigo não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    logger.error('Artigos GET slug error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      titulo, slug, autor, categoria, categoria_id,
      conteudo, resumo, imagem_destaque, data_publicacao
    } = req.body;

    if (!titulo || !slug) {
      return res.status(400).json({ error: 'titulo e slug são obrigatórios' });
    }

    // Slug único
    const [existing] = await pool.execute('SELECT id FROM artigos WHERE slug=?', [slug]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um artigo com este slug' });
    }

    const id = uuidv4();
    const now = new Date();

    await pool.execute(
      'INSERT INTO artigos (id, titulo, slug, autor, categoria, categoria_id, conteudo, resumo, imagem_destaque, data_publicacao, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, titulo, slug, autor || null, categoria || null, categoria_id || null, conteudo || null, resumo || null, imagem_destaque || null, data_publicacao || now, now, now]
    );
    res.status(201).json({ id, message: 'Criado com sucesso' });
  } catch (error) {
    logger.error('Artigos POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      titulo, slug, autor, categoria, categoria_id,
      conteudo, resumo, imagem_destaque, data_publicacao
    } = req.body;

    if (!titulo || !slug) {
      return res.status(400).json({ error: 'titulo e slug são obrigatórios' });
    }

    // Slug único (exceto o próprio artigo)
    const [existing] = await pool.execute(
      'SELECT id FROM artigos WHERE slug=? AND id != ?',
      [slug, req.params.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um artigo com este slug' });
    }

    const [result] = await pool.execute(
      'UPDATE artigos SET titulo=?, slug=?, autor=?, categoria=?, categoria_id=?, conteudo=?, resumo=?, imagem_destaque=?, data_publicacao=?, updated=? WHERE id=?',
      [titulo, slug, autor || null, categoria || null, categoria_id || null, conteudo || null, resumo || null, imagem_destaque || null, data_publicacao || null, new Date(), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    res.json({ message: 'Atualizado com sucesso' });
  } catch (error) {
    logger.error('Artigos PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM artigos WHERE id=?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Artigos DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
