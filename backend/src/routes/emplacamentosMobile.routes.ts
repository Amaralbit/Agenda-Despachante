import { Router } from 'express';
import { emplacamentosMobileController } from '../controllers/emplacamentosMobile.controller';

const router = Router();

router.get('/', emplacamentosMobileController.getByDate);
router.post('/:data/veiculos', emplacamentosMobileController.addVeiculo);
router.delete('/veiculos/:id', emplacamentosMobileController.removeVeiculo);

export default router;
