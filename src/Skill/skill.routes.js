
import { Router } from 'express';
import { createSkill, updateSkill, deactivateSkill, getAllSkillsAdmin } from './skill.controller.js';
import { validateCreateSkill, validateSkillId } from '../../middlewares/skill-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';

const router = Router();

router.use(validateJWT, hasAdminRole);

router.post('/', validateCreateSkill, createSkill);
router.put('/:id', validateSkillId, validateCreateSkill, updateSkill);
router.patch('/:id', validateSkillId, deactivateSkill);
router.get('/', getAllSkillsAdmin);

export default router;