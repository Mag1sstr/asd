import { Router } from 'express';
import { currentUser, login, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const authRoutes = Router();
authRoutes.post('/registration', asyncRoute(register));
authRoutes.post('/auth/token', asyncRoute(login));
authRoutes.get('/auth/user', requireAuth, currentUser);
