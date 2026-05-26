import { Router } from 'express';
import { getMyConversations, createConversation, changeConversationStatus } from './conversation.controller.js';
import { validateAdminDeleteConversation } from '../../middlewares/conversation-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.get('/', getMyConversations);
router.post('/', createConversation);
router.patch('/:id/status', validateAdminDeleteConversation, changeConversationStatus);

export default router;