'use strict';

import { Schema, model } from 'mongoose';

const serviceSchema = Schema({
    serviceCode: {
        type: String,
        unique: true
    },
    requestId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: [true, 'El ID de la solicitud es obligatorio']
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del cliente es obligatorio']
    },
    workerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del trabajador es obligatorio']
    },
    finalPrice: {
        type: Number,
        required: [true, 'El precio final es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    cancelReason: {
        type: String,
        default: null
    },
    cancelledBy: {
        type: String,
        enum: ['CLIENT', 'WORKER', null],
        default: null
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    }
}, { versionKey: false, timestamps: true });

// Genera SVC-001, SVC-002...
serviceSchema.pre('save', async function (next) {
    if (!this.serviceCode) {
        const count = await model('Service').countDocuments();
        this.serviceCode = `SVC-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

export default model('Service', serviceSchema);