import logger from '../utils/logger.js';

const hasPermission = (permissions, resource, action) => {
  if (!Array.isArray(permissions)) return false;

  return permissions.some((permission) => {
    if (typeof permission === 'string') {
      return permission === `${resource}:${action}`;
    }

    if (permission && typeof permission === 'object') {
      return permission.resource === resource && permission.action === action;
    }

    return false;
  });
};

export const checkPermission = (resource, action) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  if (req.user.role_name === 'super_admin') {
    return next();
  }

  if (!hasPermission(req.user.permissions, resource, action)) {
    logger.warn(`Acesso negado: user=${req.user.id} role=${req.user.role_name || 'none'} permission=${resource}:${action}`);
    return res.status(403).json({
      error: `Permissão negada para ${resource}:${action}`,
      required: { resource, action },
    });
  }

  return next();
};

export default checkPermission;
