import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';
import authService from '../services/auth.service';
import processosService from '../services/processos.service';

const statusSchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'AGUARDANDO_IMPRESSAO', 'CONCLUIDO']),
  senhaConfirmacao: z.string().optional(),
});

const querySchema = z.object({
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'AGUARDANDO_IMPRESSAO', 'CONCLUIDO']).optional(),
  search: z.string().optional(),
});

const createSchema = z.object({
  placa: z.string().trim().min(7, 'Placa invalida').max(10, 'Placa invalida'),
  numeroAtendimento: z.string().trim().min(1, 'Numero do atendimento obrigatorio'),
  solicitantePa2: z.string().trim().min(1, 'Nome do solicitante obrigatorio'),
});

const anexoSchema = z.object({
  nome: z.string().trim().min(1),
  mimeType: z.literal('application/pdf'),
  tamanho: z.number().int().positive().max(15 * 1024 * 1024),
  conteudoBase64: z.string().min(1),
});

const finalizarSchema = z.object({
  anexos: z.array(anexoSchema).default([]),
  senhaConfirmacao: z.string().optional(),
});

export const processosController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = querySchema.parse(req.query);
      const processos = await processosService.listAll(req.contaId, query);
      res.json(processos);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const processo = await processosService.findById(req.params.id, req.contaId);
      res.json(processo);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = createSchema.parse(req.body);
      const processo = await processosService.create(req.contaId, body);
      res.status(201).json(processo);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, senhaConfirmacao } = statusSchema.parse(req.body);
      const statusAtual = (await processosService.findById(req.params.id, req.contaId)).status;
      if (precisaConfirmarSenha(status, statusAtual)) {
        await confirmarSenhaParaStatus(req.userId, senhaConfirmacao, status);
      }
      const processo = await processosService.updateStatus(req.params.id, req.contaId, status);
      res.json(processo);
    } catch (err) {
      next(err);
    }
  },

  async finalizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { anexos, senhaConfirmacao } = finalizarSchema.parse(req.body);
      await confirmarSenhaParaStatus(req.userId, senhaConfirmacao, 'CONCLUIDO');
      const processo = await processosService.finalizar(req.params.id, req.contaId, anexos);
      res.json(processo);
    } catch (err) {
      next(err);
    }
  },

  async salvarAnexos(req: Request, res: Response, next: NextFunction) {
    try {
      const { anexos } = finalizarSchema.parse(req.body);
      const processo = await processosService.salvarAnexos(req.params.id, req.contaId, anexos);
      res.json(processo);
    } catch (err) {
      next(err);
    }
  },

  async getAnexo(req: Request, res: Response, next: NextFunction) {
    try {
      const anexo = await processosService.getAnexo(req.params.id, req.contaId, req.params.anexoId);
      res.setHeader('Content-Type', anexo.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(anexo.nome)}"`);
      res.send(Buffer.from(anexo.conteudo));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await processosService.delete(req.params.id, req.contaId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};

function precisaConfirmarSenha(status?: string, statusAtual?: string) {
  return status === 'CONCLUIDO' || (statusAtual === 'CONCLUIDO' && status !== 'CONCLUIDO');
}

async function confirmarSenhaParaStatus(
  userId: string,
  senhaConfirmacao: string | undefined,
  status?: string,
) {
  if (!senhaConfirmacao) {
    const acao = status === 'CONCLUIDO' ? 'concluir' : 'reabrir';
    throw new AppError(`Informe a senha para ${acao} a montagem.`, 400);
  }

  await authService.confirmPassword(userId, senhaConfirmacao);
}
