import { Router } from 'express';
import { getMessagesByConversation, sendMessage, getUnreadCount, changeMessageStatus } from './message.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.get('/unread', getUnreadCount);
router.get('/:conversationId', getMessagesByConversation);
router.post('/', sendMessage);
router.patch('/:id/status', changeMessageStatus);

export default router;