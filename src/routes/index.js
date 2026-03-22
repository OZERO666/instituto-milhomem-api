import { Router } from 'express';
import healthCheck from './health-check.js';
import authRoutes from './auth.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/auth', authRoutes);

  return router;
};
