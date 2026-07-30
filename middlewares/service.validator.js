'use strict';

import { param } from 'express-validator';
import { checkValidators } from './check.validators.js';

export const validateServiceId = [
    param('id')
        .isMongoId().withMessage('El ID del servicio no es un formato válido de MongoDB.'),
    checkValidators
];

export const validateAdminList = [
    checkValidators
];