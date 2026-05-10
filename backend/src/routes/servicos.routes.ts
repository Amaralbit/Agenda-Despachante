import { Router } from 'express';
import { servicosController } from '../controllers/servicos.controller';

const router = Router();

router.get('/',          servicosController.list);
router.get('/:id',       servicosController.getById);
router.post('/',         servicosController.create);
router.put('/:id',       servicosController.update);
router.patch('/:id/status', servicosController.updateStatus);
router.delete('/:id',    servicosController.remove);

export default router;
