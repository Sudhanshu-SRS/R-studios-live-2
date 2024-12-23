// filepath: /F:/Wifi passes/R-studios/backend/routes/imageRoute.js
import express from 'express';
import { saveImage, getImages, deleteImage } from '../controllers/imageController.js';

const router = express.Router();

router.post('/images', saveImage);
router.get('/images', getImages);
router.delete('/images/:id', deleteImage);

export default router;