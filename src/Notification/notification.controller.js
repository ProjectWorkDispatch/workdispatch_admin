import Notification from './notification.model.js';
import User from '../Users/user.model.js';

export const getNotifications = async (req, res) => {
    try {
        // El admin ya fue validado por hasAdminRole.
        // Buscamos su documento en Mongo por authUserId (viene del sub del JWT)
        // Si no existe (caso seed local), buscamos por role ADMIN como fallback
        let adminUser = await User.findOne({ authUserId: req.user.id });

        if (!adminUser) {
            adminUser = await User.findOne({ role: 'ADMIN' });
        }

        if (!adminUser) {
            return res.status(404).json({ success: false, message: 'Usuario admin no encontrado' });
        }

        const notifications = await Notification.find({ userId: adminUser._id })
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las notificaciones',
            error: error.message
        });
    }
};

export const createNotification = async (req, res) => {
    try {
        const notification = new Notification(req.body);
        await notification.save();
        res.status(201).json({ success: true, message: 'Notificación creada exitosamente', notification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear la notificación', error: error.message });
    }
};

export const editNotification = async (req, res) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedNotification) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }
        res.status(200).json({ success: true, message: 'Notificación actualizada', notification: updatedNotification });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al editar la notificación', error: error.message });
    }
};