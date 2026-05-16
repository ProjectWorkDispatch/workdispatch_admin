import Notification from './notification.model.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 }); // Más recientes primero
 
        res.status(200).json({
            success: true,
            notifications
        });
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
        const data = req.body;
        const notification = new Notification(data);
        await notification.save();

        res.status(201).json({
            success: true,
            message: 'Notificación creada exitosamente',
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la notificación',
            error: error.message
        });
    }
};

export const editNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedNotification = await Notification.findByIdAndUpdate(id, data, { new: true });

        if (!updatedNotification) {
            return res.status(404).json({ success: false, message: 'Notificación no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: 'Notificación actualizada',
            notification: updatedNotification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al editar la notificación',
            error: error.message
        });
    }
};