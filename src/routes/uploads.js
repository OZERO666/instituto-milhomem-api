// src/routes/upload.js
import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: 'dgwn32mzk',
  api_key: '163115537134413',
  api_secret: 'onLF5G711jxWihYOH9_vFEfg1FM',
});

router.post('/upload/:folder', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const { folder } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo obrigatório' });
    }

    const targetFolder = `instituto-milhomem/${folder}`;

    const stream = cloudinary.uploader.upload_stream(
      { folder: targetFolder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary error:', error);
          return res.status(500).json({ error: 'Erro ao enviar para Cloudinary' });
        }
        return res.json({ url: result.secure_url });
      },
    );

    stream.end(req.file.buffer);
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: 'Erro inesperado no upload' });
  }
});

export default router;