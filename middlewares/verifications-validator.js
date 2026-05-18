// middlewares/verifications-validator.js — ARCHIVO COMPLETO REEMPLAZADO
import { body, param } from 'express-validator';
import { checkValidators } from './check.validators.js';

const verificationStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

export const validateUpdateVerification = [

    param('id')
        .isMongoId().withMessage('ID de verificación inválido'),

    body('userId')
        .optional()
        .isMongoId().withMessage('El userId no es válido'),

    body('documentType')
        .optional()
        .isString().withMessage('El tipo de documento debe ser texto'),

    body('documentNumber')
        .optional()
        .isString().withMessage('El número de documento debe ser texto'),

    body('documentImageFront')
        .optional()
        .isString().withMessage('La imagen frontal debe ser texto'),

    body('documentImageBack')
        .optional()
        .isString().withMessage('La imagen trasera debe ser texto'),

    body('status')
        .optional()
        .isIn(verificationStatuses).withMessage('Estado inválido'),

    body('reviewedBy')
        .optional()
        .isString().withMessage('El reviewedBy debe ser texto'), // ← era .isMongoId()

    body('reviewedAt')
        .optional()
        .isISO8601().withMessage('La fecha reviewedAt no es válida'),

    body('rejectionReason')
        .optional()
        .isString().withMessage('La razón de rechazo debe ser texto'),

    checkValidators
];

export const validateUpdateVerificationStatus = [

    param('id')
        .isMongoId().withMessage('ID de verificación inválido'),

    body('status')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(verificationStatuses).withMessage('Estado inválido'),

    body('reviewedBy')
        .notEmpty().withMessage('El reviewedBy es obligatorio')
        .isString().withMessage('El reviewedBy debe ser texto'), // ← era .isMongoId()

    body('rejectionReason')
        .optional()
        .isString().withMessage('La razón de rechazo debe ser texto'),

    checkValidators
];