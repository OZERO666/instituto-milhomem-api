import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', authMiddleware, checkPermission('users', 'read'), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, resource, action, description FROM permissions ORDER BY resource ASC, action ASC'
    );

    const grouped = rows.reduce((acc, permission) => {
      if (!acc[permission.resource]) acc[permission.resource] = [];
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    res.json({
      permissions: rows,
      grouped,
    });
  } catch (error) {
    logger.error('Permissions GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
