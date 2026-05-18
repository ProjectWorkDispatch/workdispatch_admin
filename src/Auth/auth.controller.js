'use strict';

import jwt from 'jsonwebtoken';
import User from '../Users/user.model.js';
import { createUser } from '../Users/user.controller.js';

const createAccessToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: '1h' }
    );

const createRefreshToken = (user) =>
    jwt.sign(
        { uid: user._id, role: user.role, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: '7d' }
    );

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó el refresh token',
                error: 'MISSING_REFRESH_TOKEN'
            });
        }

        const payload = jwt.verify(refreshToken, process.env.SECRET_KEY);
        const user = await User.findById(payload.uid).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado',
                error: 'USER_NOT_FOUND'
            });
        }

        const accessToken = createAccessToken(user);
        const newRefreshToken = createRefreshToken(user);

        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600,
            userDetails: user
        });
    } catch (error) {
        console.error('Error refresh token:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Refresh token expirado',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Refresh token inválido',
            error: 'INVALID_TOKEN'
        });
    }
};

export { createUser as register };
