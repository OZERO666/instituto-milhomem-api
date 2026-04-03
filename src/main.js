// src/main.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import heroConfigRoutes from './routes/hero-config.js';
import routes from './routes/index.js';
import uploadRoutes from './routes/uploads.js';
import { errorMiddleware, writeLimiter, sanitizeMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';

const app = express();

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit();
});

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://www.institutomilhomem.com',
  'https://institutomilhomem.com',
  // localhost para desenvolvimento
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permite requisições sem Origin (ex: curl, health-check, mobile apps)
    if (!origin) {
      logger.info('CORS: Requisição sem origem permitida');
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      logger.info(`CORS: Origem permitida - ${origin}`);
      return callback(null, true);
    }
    logger.warn(`CORS: Origem bloqueada - ${origin}`);
    return callback(new Error(`Origin não permitido pelo CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Compressão gzip — deve vir antes de qualquer rota
app.use(compression());

// CORS antes do helmet — garante headers mesmo em respostas de erro
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Middleware global para garantir cabeçalhos CORS em respostas de erro
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(helmet());

// Bloqueia indexação por mecanismos de busca
app.use((_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  next();
});

// robots.txt — bloqueia todos os crawlers
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting apenas para escrita (anti-spam)
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return writeLimiter(req, res, next);
  }
  next();
});
app.use(sanitizeMiddleware);

// Rotas principais
app.use('/', routes());
app.use('/', uploadRoutes); // ✅ nome correto

// Nova rota HeroConfig
app.use('/hero-config', heroConfigRoutes);

// Middleware de erro
app.use(errorMiddleware);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 API Server running on http://127.0.0.1:${port}`);
});

export default app;