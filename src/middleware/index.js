const { csrfProtection } = require('./auth');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeMiddleware } = require('./auth');

// Adicionar cabeçalhos de segurança
app.use(helmet());

// Configurar rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limite de 100 requisições por IP
});
app.use(limiter);

// Adicionar proteção CSRF globalmente
app.use(csrfProtection);

// Adicionar middleware de sanitização
app.use(sanitizeMiddleware);

export { default as errorMiddleware } from './error.js';
export { authMiddleware } from './auth.js';