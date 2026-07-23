import { Router } from 'express';
import {
    getAllRequestsAdmin,
    deleteRequestAdmin,
    changeRequestStatusAdmin,
    updateRequestImageAdmin
} from './serviceRequest.controller.js';
import { validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { param } from 'express-validator';
import { checkValidators } from '../../middlewares/check.validators.js';
import { uploadServiceRequestImage } from '../../middlewares/file-uploader.js';
import { cleanupUploadedFileOnFinish, deleteFileOnError } from '../../middlewares/delete-file-on-error.js';

const router = Router();
const uploadServiceRequestPhoto = uploadServiceRequestImage.fields([
    { name: 'serviceImage', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]);

router.use(validateJWT, hasAdminRole);

router.get('/', getAllRequestsAdmin);
router.delete('/:id', validateServiceRequestId, deleteRequestAdmin);
router.patch(
    '/:id/image',
    validateServiceRequestId,
    uploadServiceRequestPhoto,
    cleanupUploadedFileOnFinish,
    updateRequestImageAdmin,
    deleteFileOnError
);
router.patch('/:id/status', [
    param('id').isMongoId().withMessage('El ID de la solicitud no es un formato válido de MongoDB.'),
    checkValidators
], changeRequestStatusAdmin);

export default router;
