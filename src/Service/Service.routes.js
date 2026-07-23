'use strict';

import { Router } from 'express';
import { getAllServices, updateServiceStatus } from './Service.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { param } from 'express-validator';
import { checkValidators } from '../../middlewares/check.validators.js';

const api = Router();

api.use(validateJWT, hasAdminRole);

api.get('/', getAllServices);
api.patch('/:id/status', [
    param('id').isMongoId().withMessage('El ID del servicio no es un formato válido de MongoDB.'),
    checkValidators
], updateServiceStatus);

export default api;