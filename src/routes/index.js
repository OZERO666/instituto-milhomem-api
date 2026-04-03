import { Router } from 'express';
import healthCheck from './health-check.js';
import authRoutes from './auth.js';
import galeriaRoutes from './galeria.js';
import galeriaTemaRoutes from './galeria-temas.js';
import depoimentosRoutes from './depoimentos.js';
import agendamentosRoutes from './agendamentos.js';
import artigosRoutes from './artigos.js';
import blogCategoriasRoutes from './blog-categorias.js';
import servicosRoutes from './servicos.js';
import estatisticasRoutes from './estatisticas.js';
import contatoConfigRoutes from './contato-config.js';
import heroPresetsRoutes from './hero-presets.js';
import sobreConfigRoutes from './sobre-config.js';
import pagesConfigRoutes from './pages-config.js';
import auditLogsRoutes from './audit-logs.js';
import seoRoutes from './seo.js';
import rolesRoutes from './roles.js';
import permissionsRoutes from './permissions.js';
import usersRoutes from './users.js';
import settingsRoutes from './settings.js';
import traducoesRoutes from './traducoes.js';
import utilsRoutes from './utils.js';

export default () => {
  // ✅ router criado DENTRO da factory — novo a cada chamada
  const router = Router();

  router.get('/health', healthCheck);
  router.use('/auth', authRoutes);
  router.use('/galeria', galeriaRoutes);
  router.use('/galeria-temas', galeriaTemaRoutes);
  router.use('/depoimentos', depoimentosRoutes);
  router.use('/agendamentos', agendamentosRoutes);
  router.use('/artigos', artigosRoutes);
  router.use('/blog-categorias', blogCategoriasRoutes);
  router.use('/servicos', servicosRoutes);
  router.use('/estatisticas', estatisticasRoutes);
  router.use('/contato-config', contatoConfigRoutes);
  router.use('/hero-presets', heroPresetsRoutes);
  router.use('/sobre-config', sobreConfigRoutes);
  router.use('/pages-config', pagesConfigRoutes);
  router.use('/audit-logs', auditLogsRoutes);
  router.use('/seo-settings', seoRoutes);
  router.use('/roles', rolesRoutes);
  router.use('/permissions', permissionsRoutes);
  router.use('/users', usersRoutes);
  router.use('/settings', settingsRoutes);
  router.use('/traducoes', traducoesRoutes);
  router.use('/utils', utilsRoutes);

  return router;
};