import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import contaService from '../services/conta.service';

const inviteSchema = z.object({ email: z.string().email('E-mail inválido') });

export const contaController = {
  async equipe(req: Request, res: Response, next: NextFunction) {
    try { res.json(await contaService.getEquipe(req.contaId)); } catch (err) { next(err); }
  },
  async criarConvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = inviteSchema.parse(req.body);
      res.status(201).json(await contaService.criarConvite(req.contaId, req.userId, email));
    } catch (err) { next(err); }
  },
  async aceitarConvite(req: Request, res: Response, next: NextFunction) {
    try {
      await contaService.aceitarConvite(req.params.token, req.userId, req.userEmail);
      res.status(204).send();
    } catch (err) { next(err); }
  },
  async cancelarConvite(req: Request, res: Response, next: NextFunction) {
    try {
      await contaService.cancelarConvite(req.contaId, req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
