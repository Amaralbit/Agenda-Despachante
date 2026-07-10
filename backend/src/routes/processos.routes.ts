import { Router } from 'express';
import { processosController } from '../controllers/processos.controller';

const router = Router();

router.get('/', processosController.list);
router.get('/:id', processosController.getById);
router.post('/', processosController.create);
router.patch('/:id/status', processosController.updateStatus);
router.post('/:id/finalizar', processosController.finalizar);
router.post('/:id/anexos', processosController.salvarAnexos);
router.get('/:id/anexos/:anexoId', processosController.getAnexo);
router.delete('/:id', processosController.remove);

export default router;
