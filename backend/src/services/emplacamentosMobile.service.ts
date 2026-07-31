import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

type Veiculo = {
  placa: string;
  marcaId: string;
  categoria: 'PASSEIO' | 'UTILITARIO';
};

const includeVeiculos = {
  veiculos: {
    include: {
      marca: { select: { id: true, nome: true, ativa: true } },
    },
    orderBy: { createdAt: 'asc' },
  },
} as const;

function dataDoRegistro(data: string) {
  return new Date(`${data}T12:00:00`);
}

function normalizarNome(nome: string) {
  return nome
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

class EmplacamentosMobileService {
  async listMarcas(contaId: string) {
    return prisma.marcaEmplacamento.findMany({
      where: { contaId },
      select: { id: true, nome: true, ativa: true, createdAt: true },
      orderBy: [{ ativa: 'desc' }, { nome: 'asc' }],
    });
  }

  async createMarca(contaId: string, nome: string) {
    const nomeLimpo = nome.trim().replace(/\s+/g, ' ');
    const nomeNormalizado = normalizarNome(nomeLimpo);
    const existente = await prisma.marcaEmplacamento.findUnique({
      where: { contaId_nomeNormalizado: { contaId, nomeNormalizado } },
    });

    if (existente) {
      if (!existente.ativa) {
        return prisma.marcaEmplacamento.update({
          where: { id: existente.id },
          data: { ativa: true, nome: nomeLimpo },
          select: { id: true, nome: true, ativa: true, createdAt: true },
        });
      }
      throw new AppError('Esta marca ja esta cadastrada.', 409);
    }

    return prisma.marcaEmplacamento.create({
      data: { contaId, nome: nomeLimpo, nomeNormalizado },
      select: { id: true, nome: true, ativa: true, createdAt: true },
    });
  }

  async updateMarca(id: string, contaId: string, ativa: boolean) {
    const marca = await prisma.marcaEmplacamento.findFirst({ where: { id, contaId } });
    if (!marca) throw new AppError('Marca nao encontrada.', 404);

    return prisma.marcaEmplacamento.update({
      where: { id },
      data: { ativa },
      select: { id: true, nome: true, ativa: true, createdAt: true },
    });
  }

  async getByDate(contaId: string, data: string) {
    const registro = await prisma.emplacamentoMobile.findUnique({
      where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
      include: includeVeiculos,
    });

    return registro ?? {
      id: null,
      data: dataDoRegistro(data),
      createdAt: null,
      updatedAt: null,
      veiculos: [],
    };
  }

  async addVeiculo(contaId: string, data: string, veiculo: Veiculo) {
    const marca = await prisma.marcaEmplacamento.findFirst({
      where: { id: veiculo.marcaId, contaId, ativa: true },
    });
    if (!marca) throw new AppError('Selecione uma marca ativa da sua conta.', 422);

    return prisma.$transaction(async (tx) => {
      const registro = await tx.emplacamentoMobile.upsert({
        where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
        create: { contaId, data: dataDoRegistro(data) },
        update: {},
      });

      const existente = await tx.emplacamentoMobileVeiculo.findUnique({
        where: {
          emplacamentoMobileId_placa: {
            emplacamentoMobileId: registro.id,
            placa: veiculo.placa,
          },
        },
      });
      if (existente) throw new AppError('Esta placa ja foi registrada para este dia.', 409);

      await tx.emplacamentoMobileVeiculo.create({
        data: { emplacamentoMobileId: registro.id, ...veiculo },
      });

      return tx.emplacamentoMobile.findUnique({
        where: { id: registro.id },
        include: includeVeiculos,
      });
    });
  }

  async removeVeiculo(id: string, contaId: string) {
    return prisma.$transaction(async (tx) => {
      const veiculo = await tx.emplacamentoMobileVeiculo.findFirst({
        where: { id, emplacamentoMobile: { contaId } },
      });
      if (!veiculo) throw new AppError('Veiculo emplacado nao encontrado.', 404);

      await tx.emplacamentoMobileVeiculo.delete({ where: { id } });
      return tx.emplacamentoMobile.findUnique({
        where: { id: veiculo.emplacamentoMobileId },
        include: includeVeiculos,
      });
    });
  }
}

export default new EmplacamentosMobileService();
