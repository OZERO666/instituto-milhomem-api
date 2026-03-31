import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/mysql.js';
import { authMiddleware } from '../middleware/auth.js';
import { checkPermission } from '../middleware/checkPermission.js';
import logger from '../utils/logger.js';

const router = Router();

const enrichRoles = async () => {
  const [roles] = await pool.execute(
    'SELECT id, name, description, created_at FROM roles ORDER BY name ASC'
  );

  const [rolePermissions] = await pool.execute(
    `SELECT rp.role_id, p.id AS permission_id, p.resource, p.action, p.description
     FROM role_permissions rp
     INNER JOIN permissions p ON p.id = rp.permission_id
     ORDER BY p.resource ASC, p.action ASC`
  );

  const permissionsByRole = rolePermissions.reduce((acc, row) => {
    if (!acc[row.role_id]) acc[row.role_id] = [];
    acc[row.role_id].push({
      id: row.permission_id,
      resource: row.resource,
      action: row.action,
      description: row.description,
    });
    return acc;
  }, {});

  return roles.map((role) => ({
    ...role,
    permissions: permissionsByRole[role.id] || [],
  }));
};

router.get('/', authMiddleware, checkPermission('users', 'read'), async (_req, res) => {
  try {
    const roles = await enrichRoles();
    res.json(roles);
  } catch (error) {
    logger.error('Roles GET error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authMiddleware, checkPermission('users', 'create'), async (req, res) => {
  try {
    const { name, description, permission_ids = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name é obrigatório' });
    }

    const [existing] = await pool.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [name]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um role com este nome' });
    }

    const roleId = uuidv4();

    await pool.execute(
      'INSERT INTO roles (id, name, description, created_at) VALUES (?, ?, ?, ?)',
      [roleId, name, description || null, new Date()]
    );

    if (Array.isArray(permission_ids) && permission_ids.length > 0) {
      const insertValues = permission_ids.map((permissionId) => [roleId, permissionId]);
      await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [insertValues]);
    }

    const roles = await enrichRoles();
    const created = roles.find((role) => role.id === roleId);

    res.status(201).json(created);
  } catch (error) {
    logger.error('Roles POST error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.put('/:id', authMiddleware, checkPermission('users', 'update'), async (req, res) => {
  try {
    const roleId = req.params.id;
    const { name, description, permission_ids = [] } = req.body;

    const [roles] = await pool.execute('SELECT id, name FROM roles WHERE id = ? LIMIT 1', [roleId]);
    if (roles.length === 0) {
      return res.status(404).json({ error: 'Role não encontrado' });
    }

    const role = roles[0];
    if (role.name === 'super_admin' && name && name !== 'super_admin') {
      return res.status(400).json({ error: 'O role super_admin não pode ser renomeado' });
    }

    if (name) {
      const [existing] = await pool.execute(
        'SELECT id FROM roles WHERE name = ? AND id <> ? LIMIT 1',
        [name, roleId]
      );
      if (existing.length > 0) {
        return res.status(409).json({ error: 'Já existe um role com este nome' });
      }
    }

    await pool.execute(
      'UPDATE roles SET name = ?, description = ? WHERE id = ?',
      [name || role.name, description || null, roleId]
    );

    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

    if (Array.isArray(permission_ids) && permission_ids.length > 0) {
      const insertValues = permission_ids.map((permissionId) => [roleId, permissionId]);
      await pool.query('INSERT INTO role_permissions (role_id, permission_id) VALUES ?', [insertValues]);
    }

    const rolesResult = await enrichRoles();
    const updated = rolesResult.find((item) => item.id === roleId);

    res.json(updated);
  } catch (error) {
    logger.error('Roles PUT error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authMiddleware, checkPermission('users', 'delete'), async (req, res) => {
  try {
    const roleId = req.params.id;

    const [roles] = await pool.execute('SELECT id, name FROM roles WHERE id = ? LIMIT 1', [roleId]);
    if (roles.length === 0) {
      return res.status(404).json({ error: 'Role não encontrado' });
    }

    if (roles[0].name === 'super_admin') {
      return res.status(400).json({ error: 'O role super_admin não pode ser removido' });
    }

    const [usersCount] = await pool.execute(
      'SELECT COUNT(*) AS total FROM users WHERE role_id = ?',
      [roleId]
    );

    if (usersCount[0].total > 0) {
      return res.status(400).json({ error: 'Não é possível deletar role com usuários vinculados' });
    }

    await pool.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
    await pool.execute('DELETE FROM roles WHERE id = ?', [roleId]);

    res.json({ message: 'Role removido com sucesso' });
  } catch (error) {
    logger.error('Roles DELETE error:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
