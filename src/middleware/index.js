import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sanitizeMiddleware, authMiddleware } from './auth.js';
import errorMiddleware from './error.js';

// Adicionar cabeçalhos de segurança
export const helmetMiddleware = helmet();

// POST/PUT/PATCH/DELETE — limite moderado para evitar spam
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 60,                   // 60 writes/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Exportações consolidadas
export { sanitizeMiddleware, authMiddleware, errorMiddleware };