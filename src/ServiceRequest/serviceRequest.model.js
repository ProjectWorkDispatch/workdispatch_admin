'use strict';

import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    title: {
        type: String,
        required: [true, 'El título es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    address: {
        type: String,
        required: [true, 'La dirección es obligatoria']
    },
    latitude: {
        type: Number,
        required: [true, 'La latitud es obligatoria para la ubicación']
    },
    longitude: {
        type: Number,
        required: [true, 'La longitud es obligatoria para la ubicación']
    },
    budgetMin: {
        type: Number,
        required: true
    },
    budgetMax: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'CLOSED'],
        default: 'OPEN'
    },
    isActive: { // <--- esto para soft delete.
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);