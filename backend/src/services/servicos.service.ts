import { StatusServico, TipoServico } from '@prisma/client';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateServicoBody, UpdateServicoBody } from '../types';

const includeRelations = {
  cliente: true,
  veiculo: true,
} as const;

class ServicosService {
  async listAll(params: { status?: StatusServico; tipo?: TipoServico; search?: string }) {
    const { status, tipo, search } = params;

    return prisma.servico.findMany({
      where: {
        ...(status && { status }),
        ...(tipo && { tipo }),
        ...(search && {
          OR: [
            { cliente: { nome: { contains: search, mode: 'insensitive' } } },
            { veiculo: { placa: { contains: search, mode: 'insensitive' } } },
            { cliente: { cpfCnpj: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      },
      include: includeRelations,
      orderBy: { dataLimite: 'asc' },
    });
  }

  async findById(id: string) {
    const servico = await prisma.servico.findUnique({
      where: { id },
      include: includeRelations,
    });

    if (!servico) throw new AppError('Serviço não encontrado.', 404);

    return servico;
  }

  async create(data: CreateServicoBody) {
    return prisma.servico.create({
      data: {
        tipo: data.tipo,
        dataLimite: new Date(data.dataLimite),
        observacoes: data.observacoes,
        clienteId: data.clienteId,
        veiculoId: data.veiculoId,
      },
      include: includeRelations,
    });
  }

  async update(id: string, data: UpdateServicoBody) {
    await this.findById(id);

    return prisma.servico.update({
      where: { id },
      data: {
        ...(data.tipo && { tipo: data.tipo }),
        ...(data.status && { status: data.status }),
        ...(data.dataLimite && { dataLimite: new Date(data.dataLimite) }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      },
      include: includeRelations,
    });
  }

  async updateStatus(id: string, status: StatusServico) {
    await this.findById(id);

    return prisma.servico.update({
      where: { id },
      data: { status },
      include: includeRelations,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.servico.delete({ where: { id } });
  }
}

export default new ServicosService();
