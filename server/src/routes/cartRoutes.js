import { Router } from 'express';
import { addToCart, getCart, removeCartItem, updateCartItem } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const cartRoutes = Router();
cartRoutes.use(requireAuth);
cartRoutes.get('/', asyncRoute(getCart));
cartRoutes.post('/items', asyncRoute(addToCart));
cartRoutes.patch('/items/:id', asyncRoute(updateCartItem));
cartRoutes.delete('/items/:id', asyncRoute(removeCartItem));
