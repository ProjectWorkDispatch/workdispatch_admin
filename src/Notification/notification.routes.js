import { Router } from 'express';
import { getNotifications, createNotification, editNotification } from './notification.controller.js';
import { createNotificationValidator, editNotificationValidator } from '../../middlewares/notification-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

// Protección global: todas las rutas requieren JWT válido y rol ADMIN
router.use(validateJWT, hasAdminRole);

router.get('/', getNotifications);

router.post('/', createNotificationValidator, createNotification);

router.put('/:id', editNotificationValidator, editNotification);

export default router;