import { Router } from 'express';
import { veiculosController } from '../controllers/veiculos.controller';

const router = Router();

router.get('/:id',    veiculosController.getById);
router.put('/:id',    veiculosController.update);
router.delete('/:id', veiculosController.remove);

export default router;
