// src/main.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import heroConfigRoutes from './routes/heroConfig.js';
import routes from './routes/index.js';
import uploadRoutes from './routes/uploads.js';
import { errorMiddleware } from './middleware/index.js';
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

app.use(helmet());

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://www.institutomilhomem.com',
  'https://institutomilhomem.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem Origin (ex: curl, health-check)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin não permitido pelo CORS: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options(/.*/, cors());

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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