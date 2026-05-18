import { Router } from 'express';
import { refreshToken } from './auth.controller.js';
import { login, createUser } from '../Users/user.controller.js';
import { validateAdminLogin, validateCreateUser } from '../../middlewares/user-validator.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';

const router = Router();

router.post('/login', validateAdminLogin, login);
router.post('/register', uploadUserProfileImage.single('profilePhoto'), validateCreateUser, createUser);
router.post('/refresh', refreshToken);

export default router;
