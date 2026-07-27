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
        required: false
    },
    customCategory: {
        type: String,
        trim: true,
        maxLength: 100,
        default: null
    },
    title: {
        type: String,
        required: [true, 'El titulo es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripcion es obligatoria']
    },
    serviceImage: {
        url: { type: String, default: null },
        public_id: { type: String, default: null }
    },
    address: {
        type: String,
        required: [true, 'La direccion es obligatoria']
    },
    latitude: {
        type: Number,
        required: [true, 'La latitud es obligatoria para la ubicacion']
    },
    longitude: {
        type: Number,
        required: [true, 'La longitud es obligatoria para la ubicacion']
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
        enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'OPEN'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('ServiceRequest', serviceRequestSchema);
