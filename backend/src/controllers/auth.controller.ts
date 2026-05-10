import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import authService from '../services/auth.service';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const registerSchema = z.object({
  nome:  z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha:  z.string().min(6),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = loginSchema.parse(req.body);
      const result = await authService.login(email, senha);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, senha } = registerSchema.parse(req.body);
      const usuario = await authService.register(nome, email, senha);
      res.status(201).json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const usuario = await authService.me(req.userId);
      res.json(usuario);
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { senhaAtual, novaSenha } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.userId, senhaAtual, novaSenha);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
