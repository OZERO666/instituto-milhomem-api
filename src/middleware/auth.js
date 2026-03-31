import jwt from 'jsonwebtoken';
import pool from '../db/mysql.js';
import logger from '../utils/logger.js';
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });
const sanitizeInput = require('../lib/sanitizeInput');

// Middleware para sanitizar entradas
function sanitizeMiddleware(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  }
  next();
}

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await pool.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users[0]) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { csrfProtection, sanitizeMiddleware };
