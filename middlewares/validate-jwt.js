// middlewares/validate-jwt.js
'use strict';

import jwt from 'jsonwebtoken';

export const validateJWT = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization') || req.header('authorization');
        const tokenHeader = req.header('x-token');

        let token = tokenHeader || authHeader || null;

        if (token && typeof token === 'string') {
            token = token.replace(/^(Bearer|bearer)\.\s*/i, '').replace(/^(Bearer|bearer)\s*/i, '');
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó un token',
                error: 'MISSING_TOKEN',
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const userId = decoded.uid || decoded.sub || decoded.id;
        const userRole = decoded.role || 'CLIENT';

        req.user = {
            id: userId,
            role: userRole
        };

        next();

    } catch (error) {
        console.error('Error de validación JWT:', error.message);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado',
                error: 'TOKEN_EXPIRED',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o malformado',
                error: 'INVALID_TOKEN',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno al validar el token',
            error: 'TOKEN_VALIDATION_ERROR',
        });
    }
};