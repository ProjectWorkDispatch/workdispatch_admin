import { Router } from 'express';
import {
    getAllConversations
} from '../Conversation/conversation.controller.js';

import {
    validateAdminDeleteMessage,
    validateAdminGetMessagesByConversation
} from '../../middlewares/message-validator.js'
import { changeMessageStatus, getUnreadCount } from './message.controller.js';
const router = Router();

router.get('/unread', getUnreadCount);
router.get('/',validateAdminGetMessagesByConversation, getAllConversations);
router.patch('/:id/status', validateAdminDeleteMessage, changeMessageStatus);

export default router;