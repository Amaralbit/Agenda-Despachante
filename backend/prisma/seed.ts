import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.usuario.upsert({
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

  let membro = await prisma.membroConta.findFirst({ where: { usuarioId: admin.id, papel: 'PROPRIETARIO' } });
  if (!membro) {
    const conta = await prisma.conta.create({ data: { nome: 'Equipe do Administrador' } });
    membro = await prisma.membroConta.create({ data: { usuarioId: admin.id, contaId: conta.id, papel: 'PROPRIETARIO' } });
  }

  await prisma.cliente.upsert({
    where: { contaId_cpfCnpj: { contaId: membro.contaId, cpfCnpj: '00.000.000/0063-00' } },
    update: { nome: 'Mobile da T-63', telefone: null },
    create: {
      nome: 'Mobile da T-63',
      cpfCnpj: '00.000.000/0063-00',
      telefone: null,
      contaId: membro.contaId,
    },
  });

  await prisma.cliente.upsert({
    where: { contaId_cpfCnpj: { contaId: membro.contaId, cpfCnpj: '00.000.000/0002-00' } },
    update: { nome: 'Mobile-Seminovos', telefone: null },
    create: {
      nome: 'Mobile-Seminovos',
      cpfCnpj: '00.000.000/0002-00',
      telefone: null,
      contaId: membro.contaId,
    },
  });

  console.log('Seed concluido: usuario administrador e clientes mobile criados/atualizados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
