import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/login',           authController.login);
router.post('/register',        authController.register);
router.get('/me',               authenticate, authController.me);
router.patch('/change-password', authenticate, authController.changePassword);
router.post('/convites/:token/aceitar', authenticate, authController.acceptInvite);

export default router;
