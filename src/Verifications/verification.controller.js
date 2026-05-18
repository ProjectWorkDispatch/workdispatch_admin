// src/Verifications/verification.controller.js
import Verification from './verification.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

// ← Se eliminó: import User from '../Users/user.model.js'
//   El rol del admin ya fue validado por validateJWT + hasAdminRole
//   antes de llegar a cualquier función de este controlador.

export const getVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find()
            .populate('userId', 'firstName lastName email role');
            // ← Se eliminó el populate de reviewedBy porque ahora es String,
            //   no una referencia a un documento de Mongo.

        res.status(200).json({
            success: true,
            data: verifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener verificaciones',
            error: error.message
        });
    }
};

export const updateVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body ? { ...req.body } : {};

        if (req.files) {
            if (req.files['documentImageFront']?.[0]) {
                updates.documentImageFront = req.files['documentImageFront'][0].path;
            }
            if (req.files['documentImageBack']?.[0]) {
                updates.documentImageBack = req.files['documentImageBack'][0].path;
            }
        }

        const verification = await Verification.findById(id);
        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud de verificación no encontrada'
            });
        }

        const verificationUpdated = await Verification.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName email role');

        res.status(200).json({
            success: true,
            message: 'Verificación actualizada correctamente',
            data: verificationUpdated
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar verificación',
            error: error.message
        });
    }
};

export const updateVerificationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewedBy, rejectionReason } = req.body;

        const verification = await Verification.findById(id);
        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud de verificación no encontrada'
            });
        }

        // ← Se eliminaron los bloques User.findById(reviewedBy) y la
        //   validación de rol: el middleware hasAdminRole ya garantiza
        //   que solo un ADMIN llega hasta aquí.

        verification.status = status;
        verification.reviewedBy = reviewedBy; // guarda "usr_UkqnMgVEVFAK" tal cual
        verification.reviewedAt = new Date();

        if (status === 'REJECTED') {
            verification.rejectionReason = rejectionReason || null;
        } else {
            verification.rejectionReason = null;
        }

        await verification.save();

        const mensaje = status === 'APPROVED'
            ? '¡Felicidades! Tu cuenta ha sido verificada.'
            : `Tu solicitud de verificación ha sido rechazada. Razón: ${rejectionReason || 'No especificada'}.`;

        await createAutomaticNotification(
            verification.userId,
            mensaje,
            `VERIFICATION_${status}`
        );

        res.status(200).json({
            success: true,
            message: `Estado de verificación actualizado a ${status}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el estado de verificación',
            error: error.message
        });
    }
};