import { Router } from 'express';
import { imageUpload, uploadImage } from '../controllers/uploadController.js';
import { adminOnly } from '../middleware/auth.js';

export const uploadRoutes = Router();
uploadRoutes.post('/', adminOnly, imageUpload.single('image'), uploadImage);
