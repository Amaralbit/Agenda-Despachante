import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

const SALT_ROUNDS = 12;

class AuthService {
  async login(email: string, senha: string) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      throw new AppError('E-mail ou senha inválidos.', 401);
    }

    const secret = process.env.JWT_SECRET as Secret;
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '8h') as SignOptions['expiresIn'];

    const token = jwt.sign(
      { sub: usuario.id, email: usuario.email },
      secret,
      { expiresIn },
    );

    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    };
  }

  async register(nome: string, email: string, senha: string) {
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) throw new AppError('E-mail já cadastrado.', 409);

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    return prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: { nome, email: email.toLowerCase(), senhaHash },
      });
      const conta = await tx.conta.create({ data: { nome: `Equipe de ${nome.trim()}` } });
      await tx.membroConta.create({
        data: { usuarioId: usuario.id, contaId: conta.id, papel: 'PROPRIETARIO' },
      });
      return { id: usuario.id, nome: usuario.nome, email: usuario.email, createdAt: usuario.createdAt };
    });
  }

  async me(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        membros: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { conta: { select: { id: true, nome: true } } },
        },
      },
    });

    if (!usuario) throw new AppError('Usuário não encontrado.', 404);

    const membro = usuario.membros[0];
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      createdAt: usuario.createdAt,
      conta: membro ? { id: membro.conta.id, nome: membro.conta.nome, papel: membro.papel } : null,
    };
  }

  async changePassword(userId: string, senhaAtual: string, novaSenha: string) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });

    if (!(await bcrypt.compare(senhaAtual, usuario.senhaHash))) {
      throw new AppError('Senha atual incorreta.', 401);
    }

    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await prisma.usuario.update({ where: { id: userId }, data: { senhaHash } });
  }

  async confirmPassword(userId: string, senha: string) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });

    if (!(await bcrypt.compare(senha, usuario.senhaHash))) {
      throw new AppError('Senha incorreta.', 403);
    }
  }
}

export default new AuthService();
