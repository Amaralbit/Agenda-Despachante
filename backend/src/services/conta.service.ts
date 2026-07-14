import { randomBytes } from 'crypto';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

class ContaService {
  async getEquipe(contaId: string) {
    return prisma.conta.findUniqueOrThrow({
      where: { id: contaId },
      select: {
        id: true,
        nome: true,
        membros: {
          select: { id: true, papel: true, createdAt: true, usuario: { select: { id: true, nome: true, email: true } } },
          orderBy: [{ papel: 'asc' }, { createdAt: 'asc' }],
        },
        convites: {
          where: { aceitoEm: null, expiraEm: { gt: new Date() } },
          select: { id: true, email: true, expiraEm: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async criarConvite(contaId: string, criadoPor: string, email: string) {
    const emailNormalizado = email.trim().toLowerCase();
    const jaMembro = await prisma.membroConta.findFirst({
      where: { contaId, usuario: { email: emailNormalizado } },
    });
    if (jaMembro) throw new AppError('Esta pessoa já faz parte da equipe.', 409);

    await prisma.conviteConta.deleteMany({ where: { contaId, email: emailNormalizado, aceitoEm: null } });
    return prisma.conviteConta.create({
      data: {
        contaId,
        criadoPor,
        email: emailNormalizado,
        token: randomBytes(32).toString('hex'),
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, email: true, token: true, expiraEm: true, createdAt: true },
    });
  }

  async aceitarConvite(token: string, usuarioId: string, email: string) {
    const convite = await prisma.conviteConta.findUnique({ where: { token } });
    if (!convite || convite.aceitoEm || convite.expiraEm <= new Date()) {
      throw new AppError('Este convite é inválido ou expirou.', 404);
    }
    if (convite.email !== email.toLowerCase()) {
      throw new AppError('Entre com o mesmo e-mail que recebeu o convite.', 403);
    }

    await prisma.$transaction([
      prisma.membroConta.upsert({
        where: { usuarioId_contaId: { usuarioId, contaId: convite.contaId } },
        update: {},
        create: { usuarioId, contaId: convite.contaId, papel: 'MEMBRO' },
      }),
      prisma.conviteConta.update({ where: { id: convite.id }, data: { aceitoEm: new Date() } }),
    ]);
  }

  async cancelarConvite(contaId: string, conviteId: string) {
    const result = await prisma.conviteConta.deleteMany({ where: { id: conviteId, contaId } });
    if (!result.count) throw new AppError('Convite não encontrado.', 404);
  }
}

export default new ContaService();
