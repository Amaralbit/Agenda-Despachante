import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import emplacamentosMobileService from '../services/emplacamentosMobile.service';

const dataSchema = z.string().date('Data invalida. Use YYYY-MM-DD.');
const quantidadesSchema = z.object({
  peugeotPasseio: z.number().int().min(0),
  peugeotUtilitario: z.number().int().min(0),
  citroenPasseio: z.number().int().min(0),
  citroenUtilitario: z.number().int().min(0),
});

export const emplacamentosMobileController = {
  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataSchema.parse(req.query.data);
      res.json(await emplacamentosMobileService.getByDate(req.contaId!, data));
    } catch (err) {
      next(err);
    }
  },

  async save(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataSchema.parse(req.params.data);
      const quantidades = quantidadesSchema.parse(req.body);
      res.json(await emplacamentosMobileService.save(req.contaId!, data, quantidades));
    } catch (err) {
      next(err);
    }
  },
};
