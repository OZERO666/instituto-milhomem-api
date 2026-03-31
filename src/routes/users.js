import { Router } from 'express';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import { hashPassword } from '../utils/auth.js';
import logger from '../utils/logger.js';

const router = Router();

const SUPER_ADMIN_ROLE_NAME = 'super_admin';

const getUsersWithPermissions = async () => {
  const [users] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name, r.description AS role_description
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     ORDER BY u.name ASC`
  );

  const [permissionsRows] = await pool.execute(
    `SELECT u.id AS user_id, p.id AS permission_id, p.resource, p.action, p.description
     FROM users u
     LEFT JOIN role_permissions rp ON rp.role_id = u.role_id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE p.id IS NOT NULL
     ORDER BY p.resource ASC, p.action ASC`
  );

  const permissionMap = permissionsRows.reduce((acc, row) => {
    if (!acc[row.user_id]) acc[row.user_id] = [];
    acc[row.user_id].push({
      id: row.permission_id,
      resource: row.resource,
      action: row.action,
      description: row.description,
    });
    return acc;
  }, {});

  return users.map((user) => ({
    ...user,
    permissions: permissionMap[user.id] || [],
  }));
};

router.get('/', authMiddleware, checkPermission('users', 'read'), async (_req, res) => {
  try {
    const users = await getUsersWithPermissions();
    res.json(users);
  } catch (error) {
    logger.error('Users GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, checkPermission('users', 'create'), async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ error: 'name, email, password e role_id são obrigatórios' });
    }

    const [roles] = await pool.execute('SELECT id FROM roles WHERE id = ? LIMIT 1', [role_id]);
    if (roles.length === 0) {
      return res.status(400).json({ error: 'role_id inválido' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe usuário com este email' });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    await pool.execute(
      'INSERT INTO users (name, email, password, role_id, created, updated) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role_id, now, now]
    );

    const users = await getUsersWithPermissions();
    const created = users.find((user) => user.email === email);

    res.status(201).json(created);
  } catch (error) {
    logger.error('Users POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, checkPermission('users', 'update'), async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role_id } = req.body;

    const [users] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role_id, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const targetUser = users[0];

    if (targetUser.role_name === SUPER_ADMIN_ROLE_NAME && role_id && role_id !== targetUser.role_id) {
      return res.status(400).json({ error: 'O usuário super_admin não pode ter o role alterado' });
    }

    if (email && email !== targetUser.email) {
      const [existing] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
        [email, userId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Já existe usuário com este email' });
      }
    }

    let finalRoleId = role_id || targetUser.role_id;
    if (role_id) {
      const [roles] = await pool.execute('SELECT id FROM roles WHERE id = ? LIMIT 1', [role_id]);
      if (roles.length === 0) {
        return res.status(400).json({ error: 'role_id inválido' });
      }
      finalRoleId = role_id;
    }

    if (password) {
      const passwordHash = await hashPassword(password);
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, role_id = ?, password = ?, updated = ? WHERE id = ?',
        [name || targetUser.name, email || targetUser.email, finalRoleId, passwordHash, new Date(), userId]
      );
    } else {
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, role_id = ?, updated = ? WHERE id = ?',
        [name || targetUser.name, email || targetUser.email, finalRoleId, new Date(), userId]
      );
    }

    const allUsers = await getUsersWithPermissions();
    const updated = allUsers.find((user) => String(user.id) === String(userId));

    res.json(updated);
  } catch (error) {
    logger.error('Users PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      `SELECT u.id, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (users[0].role_name === SUPER_ADMIN_ROLE_NAME) {
      return res.status(400).json({ error: 'O usuário super_admin não pode ser removido' });
    }

    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Usuário removido com sucesso' });
  } catch (error) {
    logger.error('Users DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
