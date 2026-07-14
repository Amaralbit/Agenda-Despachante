import { Router } from 'express';
import { lembretesController } from '../controllers/lembretes.controller';

const router = Router();

router.get('/', lembretesController.list);
router.post('/', lembretesController.create);
router.patch('/:id/conclusao', lembretesController.updateConclusao);
router.delete('/:id', lembretesController.remove);

export default router;
