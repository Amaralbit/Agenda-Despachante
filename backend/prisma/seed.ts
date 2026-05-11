import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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

  console.log('Seed concluido: usuario administrador criado sem dados de demonstracao');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
