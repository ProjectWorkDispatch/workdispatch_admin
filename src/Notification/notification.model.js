import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del usuario es obligatorio']
    },
    Message: {
        type: String,
        required: [true, 'El mensaje de la notificación es obligatorio']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    Type: {
        type: String,
        required: [true, 'El tipo de notificación es obligatorio']
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Notification', notificationSchema);