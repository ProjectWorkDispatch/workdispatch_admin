// middlewares/hasAdminRole.js
'use strict';

export const hasAdminRole = (req, res, next) => {
    // validateJWT debe ejecutarse antes; si req.user no existe, es un error de orden de middlewares
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'No autenticado. Ejecuta validateJWT antes de hasAdminRole',
            error: 'MISSING_USER_CONTEXT',
        });
    }

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: se requiere rol de Administrador',
            error: 'FORBIDDEN_ROLE',
        });
    }

    next();
};