import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import authRoutes    from './auth.routes';
import servicosRoutes from './servicos.routes';
import clientesRoutes from './clientes.routes';
import veiculosRoutes from './veiculos.routes';

const router = Router();

router.use('/auth',     authRoutes);
router.use('/servicos', authenticate, servicosRoutes);
router.use('/clientes', authenticate, clientesRoutes);
router.use('/veiculos', authenticate, veiculosRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
