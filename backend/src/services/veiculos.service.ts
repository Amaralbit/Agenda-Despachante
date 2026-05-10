import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

class VeiculosService {
  async findById(id: string) {
    const veiculo = await prisma.veiculo.findUnique({
      where: { id },
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

  async update(id: string, data: { placa?: string; modelo?: string; renavam?: string }) {
    await this.findById(id);

    return prisma.veiculo.update({
      where: { id },
      data,
      include: { cliente: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.veiculo.delete({ where: { id } });
  }
}

export default new VeiculosService();
