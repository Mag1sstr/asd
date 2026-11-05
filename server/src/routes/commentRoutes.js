import { Router } from 'express';
import { commentExists, createComment, listComments } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const commentRoutes = Router();
commentRoutes.get('/exists', requireAuth, asyncRoute(commentExists));
commentRoutes.get('/', asyncRoute(listComments));
commentRoutes.post('/', requireAuth, asyncRoute(createComment));
