// src/Verifications/verification.routes.js
import { Router } from 'express';
import {
    getVerifications,
    updateVerification,
    updateVerificationStatus
} from './verification.controller.js';

import {
    validateUpdateVerification,
    validateUpdateVerificationStatus
} from '../../middlewares/verifications-validator.js';

import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { uploadVerificationDocuments } from '../../middlewares/file-uploader.js';
import { cleanupUploadedFileOnFinish, deleteFileOnError } from '../../middlewares/delete-file-on-error.js';

const router = Router();

// Protección global: todas las rutas de este router requieren JWT válido y rol ADMIN
router.use(validateJWT, hasAdminRole);

// GET /verifications — listar todas las verificaciones
router.get('/', getVerifications);

// PUT /verifications/:id — actualización general (puede incluir imágenes del documento)
// Content-Type: multipart/form-data
// Campos de archivo opcionales: documentImageFront, documentImageBack
router.put(
    '/:id',
    uploadVerificationDocuments.fields([
        { name: 'documentImageFront', maxCount: 1 },
        { name: 'documentImageBack',  maxCount: 1 }
    ]),
    cleanupUploadedFileOnFinish,
    validateUpdateVerification,
    updateVerification,
    deleteFileOnError
);

// PATCH /verifications/:id/status — cambio de estado APPROVED / REJECTED
// Content-Type: application/json — no sube imágenes
router.patch(
    '/:id/status',
    validateUpdateVerificationStatus,
    updateVerificationStatus
);

export default router;