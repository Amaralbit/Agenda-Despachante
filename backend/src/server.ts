import 'dotenv/config';
import app from './app';
import prisma from './lib/prisma';

const PORT = Number(process.env.PORT ?? 3333);

async function bootstrap() {
  await prisma.$connect();
  console.log('[DB] Conectado ao PostgreSQL');

  app.listen(PORT, () => {
    console.log(`[API] Servidor rodando em http://localhost:${PORT}/api`);
  });
}

bootstrap().catch((err) => {
  console.error('[FATAL] Falha ao iniciar o servidor:', err);
  process.exit(1);
});
