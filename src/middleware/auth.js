import jwt from 'jsonwebtoken';
import pool from '../db/mysql.js';
import logger from '../utils/logger.js';
import sanitizeInput from '../lib/sanitizeInput.js';

// Middleware para sanitizar entradas
export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      req.body[key] = sanitizeInput(req.body[key]);
    }
  }
  next();
};

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name, r.description AS role_description,
              p.resource, p.action
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
       LEFT JOIN permissions p ON p.id = rp.permission_id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const baseUser = rows[0];
    const permissions = rows
      .filter((row) => row.resource && row.action)
      .map((row) => `${row.resource}:${row.action}`);

    req.user = {
      id: baseUser.id,
      name: baseUser.name,
      email: baseUser.email,
      role_id: baseUser.role_id,
      role_name: baseUser.role_name,
      role_description: baseUser.role_description,
      permissions: Array.from(new Set(permissions)),
    };

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error.message);
    res.status(401).json({ error: 'Token inválido' });
  }
};
