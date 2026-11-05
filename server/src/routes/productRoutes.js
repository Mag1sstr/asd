import { Router } from 'express';
import { createProduct, deleteProduct, getProduct, listFacets, listProducts, updateProduct } from '../controllers/productController.js';
import { adminOnly } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const productRoutes = Router();
productRoutes.get('/products', asyncRoute(listProducts));
productRoutes.get('/products/:id', asyncRoute(getProduct));
productRoutes.post('/products', adminOnly, asyncRoute(createProduct));
productRoutes.put('/products/:id', adminOnly, asyncRoute(updateProduct));
productRoutes.delete('/products/:id', adminOnly, asyncRoute(deleteProduct));
productRoutes.get('/:kind(brands|models|generations)', asyncRoute(listFacets));
