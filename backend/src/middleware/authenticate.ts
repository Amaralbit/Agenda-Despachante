import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { AppError } from './errorHandler';

interface JwtPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userEmail: string;
      contaId: string;
      papelConta: 'PROPRIETARIO' | 'MEMBRO';
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token de acesso não fornecido.', 401));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const membro = await prisma.membroConta.findFirst({
      where: { usuarioId: payload.sub },
      orderBy: { createdAt: 'desc' },
    });

    if (!membro) {
      return next(new AppError('Sua conta não está vinculada a uma equipe.', 403));
    }

    req.userId    = payload.sub;
    req.userEmail = payload.email;
    req.contaId = membro.contaId;
    req.papelConta = membro.papel;
    next();
  } catch {
    next(new AppError('Token inválido ou expirado.', 401));
  }
}

export function requireOwner(req: Request, _res: Response, next: NextFunction) {
  if (req.papelConta !== 'PROPRIETARIO') {
    return next(new AppError('Apenas o proprietário da conta pode gerenciar a equipe.', 403));
  }
  next();
}
