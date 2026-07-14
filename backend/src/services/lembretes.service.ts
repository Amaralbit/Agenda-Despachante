import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

class LembretesService {
  async listAll(usuarioId: string) {
    return prisma.lembrete.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(usuarioId: string, data: { titulo: string; descricao?: string; dataLembrete?: string }) {
    return prisma.lembrete.create({
      data: {
        usuarioId,
        titulo: data.titulo.trim(),
        descricao: data.descricao?.trim() || null,
        dataLembrete: data.dataLembrete ? new Date(`${data.dataLembrete}T12:00:00`) : null,
      },
    });
  }

  async updateConclusao(id: string, usuarioId: string, concluido: boolean) {
    await this.findById(id, usuarioId);
    return prisma.lembrete.update({ where: { id }, data: { concluido } });
  }

  async delete(id: string, usuarioId: string) {
    await this.findById(id, usuarioId);
    await prisma.lembrete.delete({ where: { id } });
  }

  private async findById(id: string, usuarioId: string) {
    const lembrete = await prisma.lembrete.findFirst({ where: { id, usuarioId } });
    if (!lembrete) throw new AppError('Lembrete nao encontrado.', 404);
    return lembrete;
  }
}

export default new LembretesService();
