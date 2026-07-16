import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import emplacamentosMobileService from '../services/emplacamentosMobile.service';

const dataSchema = z.string().date('Data invalida. Use YYYY-MM-DD.');
const veiculoSchema = z.object({
  placa: z.string().trim()
    .transform((placa) => placa.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .pipe(z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Informe uma placa válida.')),
  marca: z.enum(['PEUGEOT', 'CITROEN']),
  categoria: z.enum(['PASSEIO', 'UTILITARIO']),
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

  async addVeiculo(req: Request, res: Response, next: NextFunction) {
    try {
      const data = dataSchema.parse(req.params.data);
      const veiculo = veiculoSchema.parse(req.body);
      res.status(201).json(await emplacamentosMobileService.addVeiculo(req.contaId!, data, veiculo));
    } catch (err) {
      next(err);
    }
  },

  async removeVeiculo(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await emplacamentosMobileService.removeVeiculo(req.params.id, req.contaId!));
    } catch (err) {
      next(err);
    }
  },
};
