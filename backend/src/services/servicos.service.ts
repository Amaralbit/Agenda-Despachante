import { StatusServico, TipoServico } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateServicoBody, UpdateServicoBody } from '../types';

const includeRelations = {
  cliente: true,
  veiculo: true,
} as const;

class ServicosService {
  async listAll(contaId: string, params: { status?: StatusServico; tipo?: TipoServico; search?: string }) {
    const { status, tipo, search } = params;

    return prisma.servico.findMany({
      where: {
        contaId,
        ...(status && { status }),
        ...(tipo && { tipo }),
        ...(search && {
          OR: [
            { cliente: { nome: { contains: search, mode: 'insensitive' } } },
            { veiculo: { placa: { contains: search, mode: 'insensitive' } } },
            { chassi: { contains: search, mode: 'insensitive' } },
            { cliente: { cpfCnpj: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      include: includeRelations,
      orderBy: { dataLimite: 'asc' },
    });
  }

  async findById(id: string, contaId: string) {
    const servico = await prisma.servico.findFirst({
      where: { id, contaId },
      include: includeRelations,
    });

    if (!servico) throw new AppError('Serviço não encontrado.', 404);

    return servico;
  }

  async create(contaId: string, data: CreateServicoBody) {
    await prisma.cliente.findFirstOrThrow({ where: { id: data.clienteId, contaId } });
    return prisma.servico.create({
      data: {
        tipo: data.tipo,
        dataLimite: new Date(data.dataLimite),
        observacoes: data.observacoes,
        chassi: data.chassi.toUpperCase(),
        clienteId: data.clienteId,
        contaId,
      },
      include: includeRelations,
    });
  }

  async update(id: string, contaId: string, data: UpdateServicoBody) {
    await this.findById(id, contaId);

    return prisma.servico.update({
      where: { id },
      data: {
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.status && { status: data.status }),
        ...(data.dataLimite && { dataLimite: new Date(data.dataLimite) }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
        ...(data.chassi && { chassi: data.chassi.toUpperCase() }),
      },
      include: includeRelations,
    });
  }

  async updateStatus(id: string, contaId: string, status: StatusServico) {
    await this.findById(id, contaId);

    return prisma.servico.update({
      where: { id },
      data: { status },
      include: includeRelations,
    });
  }

  async delete(id: string, contaId: string) {
    await this.findById(id, contaId);
    await prisma.servico.delete({ where: { id } });
  }
}

export default new ServicosService();
