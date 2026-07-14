import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateClienteBody, CreateVeiculoBody } from '../types';

class ClientesService {
  async listAll(contaId: string, search?: string) {
    return prisma.cliente.findMany({
      where: search
        ? {
            contaId,
            OR: [
              { nome: { contains: search, mode: 'insensitive' } },
              { cpfCnpj: { contains: search, mode: 'insensitive' } },
            ],
          }
        : { contaId },
      include: { veiculos: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: string, contaId: string) {
    const cliente = await prisma.cliente.findFirst({
      where: { id, contaId },
      include: { veiculos: true, servicos: { include: { veiculo: true } } },
    });

    if (!cliente) throw new AppError('Cliente não encontrado.', 404);

    return cliente;
  }

  async create(contaId: string, data: CreateClienteBody) {
    return prisma.cliente.create({ data: { ...data, contaId }, include: { veiculos: true } });
  }

  async update(id: string, contaId: string, data: Partial<CreateClienteBody>) {
    await this.findById(id, contaId);

    return prisma.cliente.update({
      where: { id },
      data,
      include: { veiculos: true },
    });
  }

  async delete(id: string, contaId: string) {
    await this.findById(id, contaId);
    await prisma.cliente.delete({ where: { id } });
  }

  async createVeiculo(contaId: string, data: CreateVeiculoBody) {
    await this.findById(data.clienteId, contaId);

    return prisma.veiculo.create({ data: { ...data, contaId } });
  }

  async listVeiculosByCliente(clienteId: string, contaId: string) {
    await this.findById(clienteId, contaId);

    return prisma.veiculo.findMany({
      where: { clienteId, contaId },
      orderBy: { placa: 'asc' },
    });
  }
}

export default new ClientesService();
