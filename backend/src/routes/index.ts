import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import prisma from '../lib/prisma';
import authRoutes    from './auth.routes';
import servicosRoutes from './servicos.routes';
import clientesRoutes from './clientes.routes';
import veiculosRoutes from './veiculos.routes';
import processosRoutes from './processos.routes';
import lembretesRoutes from './lembretes.routes';
import contaRoutes from './conta.routes';
import emplacamentosMobileRoutes from './emplacamentosMobile.routes';

const router = Router();

router.use('/auth',     authRoutes);
router.use('/servicos', authenticate, servicosRoutes);
router.use('/clientes', authenticate, clientesRoutes);
router.use('/veiculos', authenticate, veiculosRoutes);
router.use('/processos', authenticate, processosRoutes);
router.use('/lembretes', authenticate, lembretesRoutes);
router.use('/conta', authenticate, contaRoutes);
router.use('/emplacamentos-mobile', authenticate, emplacamentosMobileRoutes);

router.get('/health', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
});

export default router;
