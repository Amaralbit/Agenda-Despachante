import { Router } from 'express';
import { contaController } from '../controllers/conta.controller';
import { requireOwner } from '../middleware/authenticate';

const router = Router();
router.get('/', contaController.equipe);
router.post('/convites', requireOwner, contaController.criarConvite);
router.delete('/convites/:id', requireOwner, contaController.cancelarConvite);
export default router;
