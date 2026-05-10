import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import clientesService from '../services/clientes.service';

const createClienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  telefone: z.string().optional(),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
});

const createVeiculoSchema = z.object({
  placa: z.string().min(7, 'Placa inválida').max(10),
  modelo: z.string().min(2),
  renavam: z.string().min(9, 'Renavam inválido'),
  clienteId: z.string().uuid('clienteId inválido'),
});

export const clientesController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const clientes = await clientesService.listAll(search);
      res.json(clientes);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cliente = await clientesService.findById(req.params.id);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createClienteSchema.parse(req.body);
      const cliente = await clientesService.create(body);
      res.status(201).json(cliente);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createClienteSchema.partial().parse(req.body);
      const cliente = await clientesService.update(req.params.id, body);
      res.json(cliente);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await clientesService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async createVeiculo(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createVeiculoSchema.parse({ ...req.body, clienteId: req.params.id });
      const veiculo = await clientesService.createVeiculo(body);
      res.status(201).json(veiculo);
    } catch (err) {
      next(err);
    }
  },

  async listVeiculos(req: Request, res: Response, next: NextFunction) {
    try {
      const veiculos = await clientesService.listVeiculosByCliente(req.params.id);
      res.json(veiculos);
    } catch (err) {
      next(err);
    }
  },
};
