import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

type Veiculo = {
  placa: string;
  marca: 'PEUGEOT' | 'CITROEN';
  categoria: 'PASSEIO' | 'UTILITARIO';
};

function dataDoRegistro(data: string) {
  return new Date(`${data}T12:00:00`);
}

class EmplacamentosMobileService {
  async getByDate(contaId: string, data: string) {
    const registro = await prisma.emplacamentoMobile.findUnique({
      where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
      include: { veiculos: { orderBy: { createdAt: 'asc' } } },
    });

    return registro ?? {
      id: null,
      data: dataDoRegistro(data),
      peugeotPasseio: 0,
      peugeotUtilitario: 0,
      citroenPasseio: 0,
      citroenUtilitario: 0,
      createdAt: null,
      updatedAt: null,
      veiculos: [],
    };
  }

  async addVeiculo(contaId: string, data: string, veiculo: Veiculo) {
    return prisma.$transaction(async (tx) => {
      const registro = await tx.emplacamentoMobile.upsert({
        where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
        create: { contaId, data: dataDoRegistro(data) },
        update: {},
      });

      const existente = await tx.emplacamentoMobileVeiculo.findUnique({
        where: { emplacamentoMobileId_placa: { emplacamentoMobileId: registro.id, placa: veiculo.placa } },
      });
      if (existente) throw new AppError('Esta placa já foi registrada para este dia.', 409);

      await tx.emplacamentoMobileVeiculo.create({
        data: { emplacamentoMobileId: registro.id, ...veiculo },
      });

      return tx.emplacamentoMobile.update({
        where: { id: registro.id },
        data: this.alteracaoQuantidade(veiculo.marca, veiculo.categoria, 1),
        include: { veiculos: { orderBy: { createdAt: 'asc' } } },
      });
    });
  }

  async removeVeiculo(id: string, contaId: string) {
    return prisma.$transaction(async (tx) => {
      const veiculo = await tx.emplacamentoMobileVeiculo.findFirst({
        where: { id, emplacamentoMobile: { contaId } },
      });
      if (!veiculo) throw new AppError('Veículo emplacado não encontrado.', 404);

      await tx.emplacamentoMobileVeiculo.delete({ where: { id } });
      return tx.emplacamentoMobile.update({
        where: { id: veiculo.emplacamentoMobileId },
        data: this.alteracaoQuantidade(veiculo.marca, veiculo.categoria, -1),
        include: { veiculos: { orderBy: { createdAt: 'asc' } } },
      });
    });
  }

  private alteracaoQuantidade(
    marca: 'PEUGEOT' | 'CITROEN',
    categoria: 'PASSEIO' | 'UTILITARIO',
    variacao: 1 | -1,
  ) {
    const mudanca = { increment: variacao };
    if (marca === 'PEUGEOT') return categoria === 'PASSEIO' ? { peugeotPasseio: mudanca } : { peugeotUtilitario: mudanca };
    return categoria === 'PASSEIO' ? { citroenPasseio: mudanca } : { citroenUtilitario: mudanca };
  }
}

export default new EmplacamentosMobileService();
