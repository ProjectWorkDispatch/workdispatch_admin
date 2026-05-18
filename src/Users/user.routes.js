import { Router } from 'express';
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    login,
    changeUserStatus
} from './user.controller.js';
import {
    validateAdminLogin,
    validateCreateUser,
    validateUpdateUser,
    validateUserIdParam,
    validateChangeUserStatus
} from '../../middlewares/user-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { hasAdminRole } from '../../middlewares/hasAdminRole.js';
import { uploadUserProfileImage } from '../../middlewares/file-uploader.js';

const router = Router();

router.post('/login', validateAdminLogin, login);

router.use(validateJWT, hasAdminRole);

router.get('/', getUsers);
router.get('/:id', validateUserIdParam, getUserById);

router.post('/', uploadUserProfileImage.single('profilePhoto'), validateCreateUser, createUser);
router.put('/:id', uploadUserProfileImage.single('profilePhoto'), validateUpdateUser, updateUser);
router.patch('/:id/status', validateChangeUserStatus, changeUserStatus);

export default router;