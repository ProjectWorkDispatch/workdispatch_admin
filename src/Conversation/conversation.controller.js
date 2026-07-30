import Conversation from './conversation.model.js';
import User from '../Users/user.model.js';

export const getMyConversations = async (req, res) => {
    try {
        const adminUser = await User.findOne({ authUserId: req.user.id }) 
                       || await User.findOne({ role: 'ADMIN' });

        if (!adminUser) {
            return res.status(404).json({ success: false, message: 'Admin no encontrado' });
        }

        const conversations = await Conversation.find({
            $or: [{ user1Id: adminUser._id }, { user2Id: adminUser._id }]
        }).populate('user1Id user2Id', 'firstName lastName email role'); // ← role agregado

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener conversaciones', error: error.message });
    }
};

export const getAllConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate('user1Id user2Id', 'firstName lastName email role')
            .sort({ lastMessageAt: -1 });

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener conversaciones', error: error.message });
    }
};

export const createConversation = async (req, res) => {
    try {
        const { user2Id } = req.body;

        const adminUser = await User.findOne({ authUserId: req.user.id })
                       || await User.findOne({ role: 'ADMIN' });

        if (!adminUser) {
            return res.status(404).json({ success: false, message: 'Admin no encontrado' });
        }

        const existing = await Conversation.findOne({
            $or: [
                { user1Id: adminUser._id, user2Id },
                { user1Id: user2Id, user2Id: adminUser._id }
            ]
        }).populate('user1Id user2Id', 'firstName lastName email role'); // ← role agregado

        if (existing) {
            return res.status(200).json({ success: true, data: existing, message: 'Conversación ya existente' });
        }

        const conversation = new Conversation({
            user1Id: adminUser._id,
            user2Id
        });
        await conversation.save();

        const populated = await Conversation.findById(conversation._id)
            .populate('user1Id user2Id', 'firstName lastName email role'); // ← role agregado

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al crear conversación', error: error.message });
    }
};

export const changeConversationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({ success: false, message: 'Conversación no encontrada' });
        }

        conversation.status = !conversation.status;
        await conversation.save();

        res.status(200).json({
            success: true,
            message: conversation.status ? 'Conversación activada' : 'Conversación desactivada',
            data: conversation
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cambiando estado', error: error.message });
    }
};