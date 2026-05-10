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

    return prisma.usuario.create({
      data: { nome, email, senhaHash },
      select: { id: true, nome: true, email: true, createdAt: true },
    });
  }

  async me(userId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, email: true, createdAt: true },
    });

    if (!usuario) throw new AppError('Usuário não encontrado.', 404);

    return usuario;
  }

  async changePassword(userId: string, senhaAtual: string, novaSenha: string) {
    const usuario = await prisma.usuario.findUniqueOrThrow({ where: { id: userId } });

    if (!(await bcrypt.compare(senhaAtual, usuario.senhaHash))) {
      throw new AppError('Senha atual incorreta.', 401);
    }

    const senhaHash = await bcrypt.hash(novaSenha, SALT_ROUNDS);
    await prisma.usuario.update({ where: { id: userId }, data: { senhaHash } });
  }
}

export default new AuthService();
