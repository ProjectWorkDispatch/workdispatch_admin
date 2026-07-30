import { Router } from 'express';
import {
    getAllConversations
} from '../Conversation/conversation.controller.js';

import {
    validateAdminDeleteMessage,
} from '../../middlewares/message-validator.js'
import { changeMessageStatus, getUnreadCount } from './message.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
const router = Router();

router.use(validateJWT, hasAdminRole);
router.get('/unread', getUnreadCount);
router.get('/', getAllConversations);
router.patch('/:id/status', validateAdminDeleteMessage, changeMessageStatus);

export default router;