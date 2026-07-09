import { StatusServico } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateProcessoAnexoBody, CreateProcessoMontagemBody } from '../types';

const includeSummary = {
  anexos: {
    select: {
      id: true,
      nome: true,
      mimeType: true,
      tamanho: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  },
} as const;

class ProcessosService {
  async listAll(params: { status?: StatusServico; search?: string }) {
    const { status, search } = params;

    return prisma.processoMontagem.findMany({
      where: {
        ...(status && { status }),
        ...(search && {
          OR: [
            { placa: { contains: search, mode: 'insensitive' } },
            { numeroAtendimento: { contains: search, mode: 'insensitive' } },
            { solicitantePa2: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: includeSummary,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const processo = await prisma.processoMontagem.findUnique({
      where: { id },
      include: includeSummary,
    });

    if (!processo) throw new AppError('Montagem de processo nao encontrada.', 404);

    return processo;
  }

  async create(data: CreateProcessoMontagemBody) {
    return prisma.processoMontagem.create({
      data: {
        placa: data.placa.toUpperCase(),
        numeroAtendimento: data.numeroAtendimento.trim(),
        solicitantePa2: data.solicitantePa2.trim(),
      },
      include: includeSummary,
    });
  }

  async updateStatus(id: string, status: StatusServico) {
    const processo = await this.findById(id);

    if (status === 'CONCLUIDO' && processo.anexos.length === 0) {
      throw new AppError('Anexe pelo menos um PDF antes de concluir a montagem.', 422);
    }

    return prisma.processoMontagem.update({
      where: { id },
      data: { status },
      include: includeSummary,
    });
  }

  async finalizar(id: string, anexos: CreateProcessoAnexoBody[]) {
    const processo = await this.findById(id);

    if (processo.status !== 'EM_ANDAMENTO') {
      throw new AppError('A montagem precisa estar em andamento para ser concluida.', 422);
    }

    if (processo.anexos.length + anexos.length === 0) {
      throw new AppError('Anexe pelo menos um PDF antes de concluir a montagem.', 422);
    }

    return prisma.$transaction(async (tx) => {
      if (anexos.length > 0) {
        await tx.processoAnexo.createMany({
          data: anexos.map((anexo) => ({
            processoId: id,
            nome: anexo.nome,
            mimeType: anexo.mimeType,
            tamanho: anexo.tamanho,
            conteudo: Buffer.from(anexo.conteudoBase64, 'base64'),
          })),
        });
      }

      return tx.processoMontagem.update({
        where: { id },
        data: { status: 'CONCLUIDO' },
        include: includeSummary,
      });
    });
  }

  async getAnexo(processoId: string, anexoId: string) {
    await this.findById(processoId);

    const anexo = await prisma.processoAnexo.findFirst({
      where: { id: anexoId, processoId },
    });

    if (!anexo) throw new AppError('Arquivo nao encontrado.', 404);

    return anexo;
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.processoMontagem.delete({ where: { id } });
  }
}

export default new ProcessosService();
