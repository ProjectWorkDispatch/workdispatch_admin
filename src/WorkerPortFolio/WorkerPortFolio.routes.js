// src/WorkerPortFolio/WorkerPortFolio.routes.js
'use strict';

import { Router } from 'express';
import {
    getAllPortfolios,
    moderateRecord,
    updatePortfolioImage
} from './WorkerPortFolio.controller.js';

import { validatePortfolioId } from '../../middlewares/workerPortFolio.validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { uploadPortfolioImage } from '../../middlewares/file-uploader.js';
import { cleanupUploadedFileOnFinish, deleteFileOnError } from '../../middlewares/delete-file-on-error.js';

const api = Router();

// Protección global: todas las rutas de este router requieren JWT válido y rol ADMIN
api.use(validateJWT, hasAdminRole);

// GET /PortFolio — listar todos los portafolios
api.get('/', getAllPortfolios);

// PATCH /PortFolio/moderate/:id — toggle ACTIVE/INACTIVE
// Content-Type: application/json — no sube imágenes
api.patch(
    '/moderate/:id',
    validatePortfolioId,
    moderateRecord
);

// PATCH /PortFolio/:id/image — reemplazar la imagen de un registro
// Content-Type: multipart/form-data, campo: portfolioImage
api.patch(
    '/:id/image',
    validatePortfolioId,
    uploadPortfolioImage.single('portfolioImage'),
    cleanupUploadedFileOnFinish,
    updatePortfolioImage,
    deleteFileOnError
);

export default api;