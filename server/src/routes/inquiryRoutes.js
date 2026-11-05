import { Router } from 'express';
import { createInquiry, listInquiries } from '../controllers/inquiryController.js';
import { adminOnly } from '../middleware/auth.js';
import { asyncRoute } from '../middleware/asyncRoute.js';

export const inquiryRoutes = Router();
inquiryRoutes.post('/', asyncRoute(createInquiry));
inquiryRoutes.get('/', adminOnly, asyncRoute(listInquiries));
