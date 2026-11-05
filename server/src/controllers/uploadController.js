import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(currentDir, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, done) => done(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, done) => done(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)),
});

export function uploadImage(req, res) {
  if (!req.file) return res.status(400).json({ error: 'Image required (JPEG, PNG, WebP, GIF; max 5 MB)' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}
