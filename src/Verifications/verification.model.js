// src/Verifications/verification.model.js
import { Schema, model } from 'mongoose';

const verificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        documentType: {
            type: String,
            enum: ['DPI', 'PASSPORT', 'LICENSE'],
            required: true
        },
        documentNumber: {
            type: String,
            required: true,
            trim: true
        },
        documentImageFront: {
            type: String,
            default: null
        },
        documentImageBack: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },
        reviewedBy: {
            type: String,   
            default: null   
        },
        reviewedAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null,
            trim: true
        }
    },
    { timestamps: true }
);

export default model('Verification', verificationSchema);