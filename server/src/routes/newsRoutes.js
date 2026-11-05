import { Router } from 'express';
import { createNews, deleteNews, getNews, listNews, updateNews } from '../controllers/newsController.js';
import { adminOnly } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const newsRoutes = Router();
newsRoutes.get('/', asyncRoute(listNews));
newsRoutes.get('/:id', asyncRoute(getNews));
newsRoutes.post('/', adminOnly, asyncRoute(createNews));
newsRoutes.put('/:id', adminOnly, asyncRoute(updateNews));
newsRoutes.delete('/:id', adminOnly, asyncRoute(deleteNews));
