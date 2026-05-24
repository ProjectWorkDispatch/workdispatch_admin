import { Router } from 'express';
import {
    getAllUserSkillsAdmin,
    assignSkillToUser,
    removeSkillFromUser
} from './userSkill.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.get('/', getAllUserSkillsAdmin);
router.post('/', assignSkillToUser);
router.delete('/:id', removeSkillFromUser);

export default router;