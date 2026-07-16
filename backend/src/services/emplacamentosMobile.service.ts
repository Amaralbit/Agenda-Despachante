import prisma from '../lib/prisma';

type Quantidades = {
  peugeotPasseio: number;
  peugeotUtilitario: number;
  citroenPasseio: number;
  citroenUtilitario: number;
};

function dataDoRegistro(data: string) {
  return new Date(`${data}T12:00:00`);
}

class EmplacamentosMobileService {
  async getByDate(contaId: string, data: string) {
    const registro = await prisma.emplacamentoMobile.findUnique({
      where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
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
    };
  }

  async save(contaId: string, data: string, quantidades: Quantidades) {
    return prisma.emplacamentoMobile.upsert({
      where: { contaId_data: { contaId, data: dataDoRegistro(data) } },
      create: { contaId, data: dataDoRegistro(data), ...quantidades },
      update: quantidades,
    });
  }
}

export default new EmplacamentosMobileService();
