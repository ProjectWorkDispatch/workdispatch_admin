import Message from './message.model.js';

// Obtener mensajes de una conversación y marcarlos como leídos
export const getMessagesByConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .populate('senderId', 'firstName lastName role')
            .sort({ createdAt: 1 });

        // Marcar como leídos los mensajes que no son del admin
        await Message.updateMany(
            { conversationId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener mensajes', error: error.message });
    }
};

// Enviar un mensaje
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, senderId, content } = req.body;

        const message = new Message({ conversationId, senderId, content });
        await message.save();

        // Actualizar lastMessage en la conversación
        const Conversation = (await import('../Conversation/conversation.model.js')).default;
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: content,
            lastMessageAt: new Date()
        });

        const populated = await Message.findById(message._id)
            .populate('senderId', 'firstName lastName role');

        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al enviar mensaje', error: error.message });
    }
};

// Contar mensajes no leídos del admin (para el botón del navbar)
export const getUnreadCount = async (req, res) => {
    try {
        const Conversation = (await import('../Conversation/conversation.model.js')).default;
        const User = (await import('../Users/user.model.js')).default;

        const adminUser = await User.findOne({ authUserId: req.user.id })
                       || await User.findOne({ role: 'ADMIN' });

        if (!adminUser) return res.status(200).json({ success: true, unread: 0 });

        // Conversaciones del admin
        const convs = await Conversation.find({
            $or: [{ user1Id: adminUser._id }, { user2Id: adminUser._id }]
        });

        const convIds = convs.map(c => c._id);

        // Mensajes no leídos que NO son del admin
        const unread = await Message.countDocuments({
            conversationId: { $in: convIds },
            senderId: { $ne: adminUser._id },
            isRead: false
        });

        res.status(200).json({ success: true, unread });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al contar mensajes', error: error.message });
    }
};

export const changeMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Message.findById(id);
        if (!message) return res.status(404).json({ success: false, message: 'Mensaje no encontrado' });

        message.status = !message.status;
        await message.save();

        res.status(200).json({
            success: true,
            message: message.status ? 'Mensaje activado' : 'Mensaje desactivado',
            data: message
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cambiando estado', error: error.message });
    }
};

