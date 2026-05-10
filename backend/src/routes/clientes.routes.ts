import { Router } from 'express';
import { clientesController } from '../controllers/clientes.controller';

const router = Router();

router.get('/',                         clientesController.list);
router.get('/:id',                      clientesController.getById);
router.post('/',                        clientesController.create);
router.put('/:id',                      clientesController.update);
router.delete('/:id',                   clientesController.remove);
router.get('/:id/veiculos',             clientesController.listVeiculos);
router.post('/:id/veiculos',            clientesController.createVeiculo);

export default router;
