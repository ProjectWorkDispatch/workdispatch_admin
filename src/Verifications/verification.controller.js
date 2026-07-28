import Verification from './verification.model.js';
import User from '../Users/user.model.js';
import { createAutomaticNotification } from '../helpers/notification.helper.js';

export const getVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find()
            .populate('userId', 'firstName lastName email role')
            .populate('reviewedBy', 'firstName lastName email role');

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
        const updates = req.body || {};

        const verification = await Verification.findById(id);
        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud de verificación no encontrada'
            });
        }

        if (updates.reviewedBy) {
            const reviewer = await User.findById(updates.reviewedBy);

            if (!reviewer) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario reviewer no encontrado'
                });
            }

            if (reviewer.role !== 'ADMIN') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo un usuario con rol ADMIN puede ser reviewer'
                });
            }
        }

        const verificationUpdated = await Verification.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        )
            .populate('userId', 'firstName lastName email role')
            .populate('reviewedBy', 'firstName lastName email role');

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

        const reviewer = await User.findById(reviewedBy);

        if (!reviewer) {
            return res.status(404).json({
                success: false,
                message: 'Usuario reviewer no encontrado'
            });
        }

        if (reviewer.role !== 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: 'Solo un usuario con rol ADMIN puede revisar verificaciones'
            });
        }

        verification.status = status;
        verification.reviewedBy = reviewedBy;
        verification.reviewedAt = new Date();

        if (status === 'REJECTED') {
            verification.rejectionReason = rejectionReason || null;
        } else {
            verification.rejectionReason = null;
        }

        await verification.save();

        console.log(`[VERIFICATION] status=${status}, userId=${verification.userId}`);

        if (status === 'APPROVED') {
            const updateResult = await User.findByIdAndUpdate(verification.userId, { verificationStatus: true });
            console.log(`[VERIFICATION] User.findByIdAndUpdate result:`, updateResult ? { _id: updateResult._id, verificationStatus: updateResult.verificationStatus } : 'null');
        } else if (status === 'REJECTED') {
            const updateResult = await User.findByIdAndUpdate(verification.userId, { verificationStatus: false });
            console.log(`[VERIFICATION] User.findByIdAndUpdate REJECTED result:`, updateResult ? { _id: updateResult._id, verificationStatus: updateResult.verificationStatus } : 'null');
        }

        const mensaje = status === 'APPROVED' 
            ? '¡Felicidades! Tu cuenta ha sido verificada.' 
            : `Tu solicitud de verificación ha sido rechazada. Razón: ${rejectionReason || 'No especificada'}.`;
            
        await createAutomaticNotification(
            verification.userId, 
            mensaje, 
            `VERIFICATION_${status}`
        );

        const verificationUpdated = await Verification.findById(id)
            .populate('userId', 'firstName lastName email role')
            .populate('reviewedBy', 'firstName lastName email role');

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