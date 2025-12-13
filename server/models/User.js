const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String, // Hashed password
        select: false
    },
    password_plain: {
        type: String, // For Admin viewing (as requested)
        select: false
    },
    name: {
        type: String,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    semester: {
        type: String, // e.g., 'S5', 'S7'
        trim: true
    },
    mobile: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    approved: {
        type: Boolean,
        default: true // Auto-approve by default
    },
    paired_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    progress: {
        gift_ready: { type: Boolean, default: false },
        gift_delivered: { type: Boolean, default: false },
        gift_received: { type: Boolean, default: false }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    detailsCompleted: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', UserSchema);
