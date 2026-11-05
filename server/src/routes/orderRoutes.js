import { Router } from 'express';
import { createOrder, listOrders } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const orderRoutes = Router();
orderRoutes.use(requireAuth);
orderRoutes.get('/', asyncRoute(listOrders));
orderRoutes.post('/', asyncRoute(createOrder));
