import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();
const FILTROS_VALIDOS = ['Geral', 'Coroa', 'Entradas', 'Barba'];

// ─── Multer: salva em /uploads/galeria ──────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/galeria';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ─── GET ─────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { filtro } = req.query;
    let rows;

    if (filtro && filtro !== 'Geral') {
      if (!FILTROS_VALIDOS.includes(filtro)) {
        return res.status(400).json({ error: 'Filtro inválido' });
      }
      [rows] = await pool.execute(
        'SELECT * FROM galeria WHERE filtro = ? ORDER BY created DESC', [filtro]
      );
    } else {
      [rows] = await pool.execute('SELECT * FROM galeria ORDER BY created DESC');
    }

    res.json(rows);
  } catch (error) {
    logger.error('Galeria GET error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// ─── POST (com upload) ────────────────────────────────────────────────────────
router.post(
  '/',
  authMiddleware,
  upload.fields([{ name: 'foto_antes', maxCount: 1 }, { name: 'foto_depois', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { titulo, descricao, filtro, meses_pos_operatorio, tema_id } = req.body;

      const foto_antes  = req.files?.foto_antes?.[0]?.filename  || null;
      const foto_depois = req.files?.foto_depois?.[0]?.filename || null;

      if (!foto_antes || !foto_depois) {
        return res.status(400).json({ error: 'foto_antes e foto_depois são obrigatórios' });
      }

      if (filtro && !FILTROS_VALIDOS.includes(filtro)) {
        return res.status(400).json({ error: 'Filtro inválido' });
      }

      const id  = uuidv4();
      const now = new Date();

      await pool.execute(
        'INSERT INTO galeria (id, titulo, descricao, filtro, foto_antes, foto_depois, meses_pos_operatorio, tema_id, created, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, titulo || null, descricao || null, filtro || 'Geral', foto_antes, foto_depois, meses_pos_operatorio ?? 0, tema_id || null, now, now]
      );

      res.status(201).json({ id, foto_antes, foto_depois, message: 'Criado com sucesso' });
    } catch (error) {
      logger.error('Galeria POST error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// ─── PUT (com upload opcional) ────────────────────────────────────────────────
router.put(
  '/:id',
  authMiddleware,
  upload.fields([{ name: 'foto_antes', maxCount: 1 }, { name: 'foto_depois', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { titulo, descricao, filtro, meses_pos_operatorio, tema_id } = req.body;

      // Busca registro atual para manter fotos antigas se não enviar novas
      const [[current]] = await pool.execute('SELECT * FROM galeria WHERE id = ?', [req.params.id]);
      if (!current) return res.status(404).json({ error: 'Item não encontrado' });

      const foto_antes  = req.files?.foto_antes?.[0]?.filename  || current.foto_antes;
      const foto_depois = req.files?.foto_depois?.[0]?.filename || current.foto_depois;

      if (filtro && !FILTROS_VALIDOS.includes(filtro)) {
        return res.status(400).json({ error: 'Filtro inválido' });
      }

      await pool.execute(
        'UPDATE galeria SET titulo=?, descricao=?, filtro=?, foto_antes=?, foto_depois=?, meses_pos_operatorio=?, tema_id=?, updated=? WHERE id=?',
        [titulo || null, descricao || null, filtro || 'Geral', foto_antes, foto_depois, meses_pos_operatorio ?? 0, tema_id || null, new Date(), req.params.id]
      );

      res.json({ message: 'Atualizado com sucesso', foto_antes, foto_depois });
    } catch (error) {
      logger.error('Galeria PUT error:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
);

// ─── DELETE ───────────────────────────────────────────────────────────────────
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[current]] = await pool.execute('SELECT * FROM galeria WHERE id = ?', [req.params.id]);
    if (!current) return res.status(404).json({ error: 'Item não encontrado' });

    // Remove arquivos físicos
    ['foto_antes', 'foto_depois'].forEach(field => {
      if (current[field]) {
        const filePath = path.join('uploads/galeria', current[field]);
        fs.unlink(filePath, () => {});
      }
    });

    await pool.execute('DELETE FROM galeria WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deletado com sucesso' });
  } catch (error) {
    logger.error('Galeria DELETE error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;