import Message from './message.model.js';

export const changeMessageStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const message = await Message.findById(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        // Cambiar estado automáticamente
        message.status = !message.status;

        await message.save();

        res.status(200).json({
            success: true,
            message: message.status
                ? 'Mensaje activado'
                : 'Mensaje desactivado',
            data: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cambiando estado del mensaje',
            error: error.message
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ isRead: false, status: true });
        res.status(200).json({ success: true, unread: count });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener mensajes no leídos',
            error: error.message
        });
    }
};