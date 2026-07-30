'use strict';

import { Schema, model } from 'mongoose';

const proposalSchema = Schema({
    serviceRequestId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'El ID de la solicitud es obligatorio']
    },
    workerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del trabajador es obligatorio']
    },
    price: {
        type: Number,
        required: [true, 'El precio de la propuesta es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    message: {
        type: String,
        required: [true, 'El mensaje de la propuesta es obligatorio'],
        maxLength: [500, 'El mensaje no puede exceder los 500 caracteres']
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxLength: [300, 'El motivo no puede exceder los 300 caracteres'],
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
        default: 'PENDING'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { versionKey: false, timestamps: true });

export default model('Proposal', proposalSchema);