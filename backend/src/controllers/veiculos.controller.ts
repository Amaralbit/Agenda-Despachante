import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import veiculosService from '../services/veiculos.service';

const updateSchema = z.object({
  placa:   z.string().min(7).max(10).optional(),
  modelo:  z.string().min(2).optional(),
  renavam: z.string().min(9).optional(),
});

export const veiculosController = {
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const veiculo = await veiculosService.findById(req.params.id);
      res.json(veiculo);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateSchema.parse(req.body);
      const veiculo = await veiculosService.update(req.params.id, body);
      res.json(veiculo);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await veiculosService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
