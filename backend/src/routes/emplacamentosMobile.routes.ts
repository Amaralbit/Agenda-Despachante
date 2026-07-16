import { Router } from 'express';
import { emplacamentosMobileController } from '../controllers/emplacamentosMobile.controller';

const router = Router();

router.get('/', emplacamentosMobileController.getByDate);
router.put('/:data', emplacamentosMobileController.save);

export default router;
