import { Router } from 'express';
import {
    getAllRequestsAdmin,
    deleteRequestAdmin,
    changeRequestStatusAdmin
} from './serviceRequest.controller.js';
import { validateServiceRequestId } from '../../middlewares/serviceRequest-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { param } from 'express-validator';
import { checkValidators } from '../../middlewares/check.validators.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.get('/', getAllRequestsAdmin);
router.delete('/:id', validateServiceRequestId, deleteRequestAdmin);
router.patch('/:id/status', [
    param('id').isMongoId().withMessage('El ID de la solicitud no es un formato válido de MongoDB.'),
    checkValidators
], changeRequestStatusAdmin);

export default router;