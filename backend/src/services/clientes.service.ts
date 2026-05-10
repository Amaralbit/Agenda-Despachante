import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { CreateClienteBody, CreateVeiculoBody } from '../types';

class ClientesService {
  async listAll(search?: string) {
    return prisma.cliente.findMany({
      where: search
        ? {
            OR: [
              { nome: { contains: search, mode: 'insensitive' } },
              { cpfCnpj: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { veiculos: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: string) {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: { veiculos: true, servicos: { include: { veiculo: true } } },
    });

    if (!cliente) throw new AppError('Cliente não encontrado.', 404);

    return cliente;
  }

  async create(data: CreateClienteBody) {
    return prisma.cliente.create({ data, include: { veiculos: true } });
  }

  async update(id: string, data: Partial<CreateClienteBody>) {
    await this.findById(id);

    return prisma.cliente.update({
      where: { id },
      data,
      include: { veiculos: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await prisma.cliente.delete({ where: { id } });
  }

  async createVeiculo(data: CreateVeiculoBody) {
    await this.findById(data.clienteId);

    return prisma.veiculo.create({ data });
  }

  async listVeiculosByCliente(clienteId: string) {
    await this.findById(clienteId);

    return prisma.veiculo.findMany({
      where: { clienteId },
      orderBy: { placa: 'asc' },
    });
  }
}

export default new ClientesService();
