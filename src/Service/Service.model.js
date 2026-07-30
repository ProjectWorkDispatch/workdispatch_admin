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
    },
    scheduledDate: {
        type: Date,
        default: null
    },
    estimatedDurationDays: {
        type: Number,
        default: null,
        min: 1
    },
    estimatedStartDate: {
        type: Date,
        default: null
    },
    estimatedEndDate: {
        type: Date,
        default: null
    },
    generalPlan: {
        type: String,
        default: '',
        maxLength: 1000
    },
    workPlan: [{
        dayNumber: { type: Number, required: true },
        date: { type: Date, required: true },
        description: { type: String, required: true, maxLength: 300 },
        status: {
            type: String,
            enum: ['PENDING', 'DONE', 'VERIFIED', 'DISPUTED'],
            default: 'PENDING'
        },
        clientNote: { type: String, default: null, maxLength: 300 },
        verifiedAt: { type: Date, default: null },
        disputedAt: { type: Date, default: null }
    }]
}, { versionKey: false, timestamps: true });

// Genera SVC-001, SVC-002...
serviceSchema.pre('save', async function () {
    if (!this.serviceCode) {
        const count = await this.constructor.countDocuments();
        this.serviceCode = `SVC-${String(count + 1).padStart(3, '0')}`;
    }
});

export default model('Service', serviceSchema);
