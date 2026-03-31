import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import pool from '../db/mysql.js';
import { comparePassword, generateToken } from '../utils/auth.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Rate limit para login (protege contra brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                  // máximo 10 tentativas
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'Muitas tentativas. Tente novamente em 15 minutos.',
      retryAfter: Math.ceil((15 * 60 * 1000 - (Date.now() - req.rateLimit.resetTime)) / 1000)
    });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.password, u.role_id,
              r.name AS role_name, r.description AS role_description
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      logger.warn(`Tentativa de login falhou: email ${email} não encontrado`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      logger.warn(`Tentativa de login falhou: email ${email}, senha inválida`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const [permissionsRows] = await pool.execute(
      `SELECT p.resource, p.action
       FROM role_permissions rp
       INNER JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = ?
       ORDER BY p.resource ASC, p.action ASC`,
      [user.role_id]
    );

    const permissions = permissionsRows.map((row) => `${row.resource}:${row.action}`);

    const token = generateToken({
      id: user.id,
      role_id: user.role_id,
      role_name: user.role_name,
      permissions,
    });

    logger.info(`Login bem-sucedido: user ${user.id} (${user.email})`);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        role_description: user.role_description,
        permissions,
      },
    });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role_id: req.user.role_id,
        role_name: req.user.role_name,
        role_description: req.user.role_description,
        permissions: req.user.permissions || [],
      },
    });
  } catch (error) {
    logger.error('Auth me error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
