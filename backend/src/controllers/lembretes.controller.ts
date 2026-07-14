import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import lembretesService from '../services/lembretes.service';

const createSchema = z.object({
  titulo: z.string().trim().min(1, 'Informe o titulo do lembrete.').max(160),
  descricao: z.string().trim().max(1000).optional(),
  dataLembrete: z.string().date('Data invalida. Use YYYY-MM-DD.').optional(),
});

const conclusaoSchema = z.object({
  concluido: z.boolean(),
});

export const lembretesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await lembretesService.listAll(req.userId!));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      res.status(201).json(await lembretesService.create(req.userId!, body));
    } catch (err) {
      next(err);
    }
  },

  async updateConclusao(req: Request, res: Response, next: NextFunction) {
    try {
      const { concluido } = conclusaoSchema.parse(req.body);
      res.json(await lembretesService.updateConclusao(req.params.id, req.userId!, concluido));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await lembretesService.delete(req.params.id, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
