import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import servicosService from '../services/servicos.service';

const createSchema = z.object({
  tipo: z.enum(['INCLUSAO_VEICULO_NOVO', 'TRANSFERENCIA', 'INTENCAO_DE_VENDA', 'OUTROS']),
  dataLimite: z.string().date('Data limite inválida (use YYYY-MM-DD)'),
  observacoes: z.string().optional(),
  clienteId: z.string().uuid('clienteId inválido'),
  veiculoId: z.string().uuid('veiculoId inválido'),
});

const updateSchema = z.object({
  tipo: z.enum(['INCLUSAO_VEICULO_NOVO', 'TRANSFERENCIA', 'INTENCAO_DE_VENDA', 'OUTROS']).optional(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO']).optional(),
  dataLimite: z.string().date().optional(),
  observacoes: z.string().nullable().optional(),
});

const statusSchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO']),
});

const querySchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO']).optional(),
  tipo: z.enum(['INCLUSAO_VEICULO_NOVO', 'TRANSFERENCIA', 'INTENCAO_DE_VENDA', 'OUTROS']).optional(),
  search: z.string().optional(),
});

export const servicosController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = querySchema.parse(req.query);
      const servicos = await servicosService.listAll(query);
      res.json(servicos);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const servico = await servicosService.findById(req.params.id);
      res.json(servico);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const servico = await servicosService.create(body);
      res.status(201).json(servico);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = updateSchema.parse(req.body);
      const servico = await servicosService.update(req.params.id, body);
      res.json(servico);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = statusSchema.parse(req.body);
      const servico = await servicosService.updateStatus(req.params.id, status);
      res.json(servico);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await servicosService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
