
import { Router } from 'express';
import { getAllUserSkillsAdmin } from './userSkill.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

// Ver todas las habilidades vinculadas a usuarios
router.get('/', getAllUserSkillsAdmin);

export default router;