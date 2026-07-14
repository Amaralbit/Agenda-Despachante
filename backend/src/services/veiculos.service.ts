import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

class VeiculosService {
  async findById(id: string, contaId: string) {
    const veiculo = await prisma.veiculo.findFirst({
      where: { id, contaId },
      include: {
        cliente: true,
        servicos: {
          include: { cliente: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!veiculo) throw new AppError('Veículo não encontrado.', 404);

    return veiculo;
  }

  async update(id: string, contaId: string, data: { placa?: string; modelo?: string; renavam?: string }) {
    await this.findById(id, contaId);

    return prisma.veiculo.update({
      where: { id },
      data,
      include: { cliente: true },
    });
  }

  async delete(id: string, contaId: string) {
    await this.findById(id, contaId);
    await prisma.veiculo.delete({ where: { id } });
  }
}

export default new VeiculosService();
