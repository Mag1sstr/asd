import { Router } from 'express';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';
import { adminOnly } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const categoryRoutes = Router();
categoryRoutes.get('/', asyncRoute(listCategories));
categoryRoutes.post('/', adminOnly, asyncRoute(createCategory));
categoryRoutes.put('/:id', adminOnly, asyncRoute(updateCategory));
categoryRoutes.delete('/:id', adminOnly, asyncRoute(deleteCategory));
