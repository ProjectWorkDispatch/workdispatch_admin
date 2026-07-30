'use strict';

import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'El ID del servicio es obligatorio']
    },
    reviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID de quien evalúa es obligatorio']
    },
    revieweredId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El ID del evaluado es obligatorio']
    },
    Rating: {
        type: Number,
        required: [true, 'El rating es obligatorio'],
        min: 1,
        max: 5 
    },
    Comment: {
        type: String,
        required: [true, 'El comentario es obligatorio']
    },
    LowRatingReasons: {
        type: [String],
        default: undefined
    },
    Status: {
        type: Boolean,
        default: true 
    }
}, {
    timestamps: true,
    versionKey: false 
});

export default model('Review', reviewSchema);