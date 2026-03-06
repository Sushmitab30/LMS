import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller';
import { validateBody } from '../../middleware/validateRequest';
import { authenticate } from '../../middleware/authenticate';
import { registerSchema, loginSchema } from './auth.validator';

const router: RouterType = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
