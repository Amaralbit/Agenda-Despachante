import { PrismaClient, StatusServico, TipoServico } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const clientesDemo = [
  {
    nome: 'Joao Silva',
    telefone: '(11) 99999-1111',
    cpfCnpj: '123.456.789-00',
  },
  {
    nome: 'Maria Souza',
    telefone: '(11) 98888-2222',
    cpfCnpj: '987.654.321-00',
  },
  {
    nome: 'Carlos Mendes',
    telefone: '(11) 97777-3333',
    cpfCnpj: '12.345.678/0001-99',
  },
] as const;

const veiculosDemo = [
  {
    placa: 'ABC-1234',
    modelo: 'Honda Civic 2022',
    renavam: '12345678901',
    clienteCpfCnpj: '123.456.789-00',
  },
  {
    placa: 'XYZ-5678',
    modelo: 'Toyota Corolla 2023',
    renavam: '98765432109',
    clienteCpfCnpj: '987.654.321-00',
  },
  {
    placa: 'DEF-9012',
    modelo: 'VW Gol 2021',
    renavam: '11223344556',
    clienteCpfCnpj: '12.345.678/0001-99',
  },
] as const;

const servicosDemo = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    tipo: TipoServico.TRANSFERENCIA,
    status: StatusServico.PENDENTE,
    dataLimite: new Date('2026-05-15'),
    observacoes: 'Aguardando CRV do vendedor',
    clienteCpfCnpj: '123.456.789-00',
    veiculoPlaca: 'ABC-1234',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    tipo: TipoServico.INCLUSAO_VEICULO_NOVO,
    status: StatusServico.EM_ANDAMENTO,
    dataLimite: new Date('2026-05-20'),
    observacoes: null,
    clienteCpfCnpj: '987.654.321-00',
    veiculoPlaca: 'XYZ-5678',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    tipo: TipoServico.INTENCAO_DE_VENDA,
    status: StatusServico.PENDENTE,
    dataLimite: new Date('2026-05-12'),
    observacoes: 'Falta documento do comprador',
    clienteCpfCnpj: '12.345.678/0001-99',
    veiculoPlaca: 'DEF-9012',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    tipo: TipoServico.OUTROS,
    status: StatusServico.CONCLUIDO,
    dataLimite: new Date('2026-05-01'),
    observacoes: null,
    clienteCpfCnpj: '123.456.789-00',
    veiculoPlaca: 'ABC-1234',
  },
] as const;

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 12);

  await prisma.usuario.upsert({
    where: { email: 'admin@despachante.com' },
    update: {
      nome: 'Administrador',
      senhaHash,
    },
    create: {
      nome: 'Administrador',
      email: 'admin@despachante.com',
      senhaHash,
    },
  });

  const clientesPorCpf = new Map<string, { id: string }>();

  for (const cliente of clientesDemo) {
    const saved = await prisma.cliente.upsert({
      where: { cpfCnpj: cliente.cpfCnpj },
      update: {
        nome: cliente.nome,
        telefone: cliente.telefone,
      },
      create: cliente,
      select: { id: true },
    });

    clientesPorCpf.set(cliente.cpfCnpj, saved);
  }

  const veiculosPorPlaca = new Map<string, { id: string }>();

  for (const veiculo of veiculosDemo) {
    const cliente = clientesPorCpf.get(veiculo.clienteCpfCnpj);
    if (!cliente) throw new Error(`Cliente nao encontrado para ${veiculo.placa}`);

    const saved = await prisma.veiculo.upsert({
      where: { placa: veiculo.placa },
      update: {
        modelo: veiculo.modelo,
        renavam: veiculo.renavam,
        clienteId: cliente.id,
      },
      create: {
        placa: veiculo.placa,
        modelo: veiculo.modelo,
        renavam: veiculo.renavam,
        clienteId: cliente.id,
      },
      select: { id: true },
    });

    veiculosPorPlaca.set(veiculo.placa, saved);
  }

  for (const servico of servicosDemo) {
    const cliente = clientesPorCpf.get(servico.clienteCpfCnpj);
    const veiculo = veiculosPorPlaca.get(servico.veiculoPlaca);

    if (!cliente || !veiculo) {
      throw new Error(`Relacionamento nao encontrado para servico ${servico.id}`);
    }

    await prisma.servico.upsert({
      where: { id: servico.id },
      update: {
        tipo: servico.tipo,
        status: servico.status,
        dataLimite: servico.dataLimite,
        observacoes: servico.observacoes,
        clienteId: cliente.id,
        veiculoId: veiculo.id,
      },
      create: {
        id: servico.id,
        tipo: servico.tipo,
        status: servico.status,
        dataLimite: servico.dataLimite,
        observacoes: servico.observacoes,
        clienteId: cliente.id,
        veiculoId: veiculo.id,
      },
    });
  }

  console.log('Seed concluido: admin + 3 clientes + 3 veiculos + 4 servicos');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
