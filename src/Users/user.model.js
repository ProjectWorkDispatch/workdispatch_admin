import { Schema, model } from 'mongoose';

const userSchema = Schema({
    authUserId: {
        type: String,
        unique: true,
        sparse: true
    },
    firstName: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'El telefono es obligatorio']
    },
    role: {
        type: String,
        enum: ['CLIENT', 'WORKER', 'ADMIN'],
        default: 'CLIENT'
    },
    profilePhoto: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: ''
    },
    ratingAverage: {
        type: Number,
        default: 1,
        min: 1,
        max: 5
    },
    disputeCount: {
        type: Number,
        default: 0,
        min: 0
    },
    verificationStatus: {
        type: Boolean,
        default: false
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    address: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    }
});

export default model('User', userSchema);
