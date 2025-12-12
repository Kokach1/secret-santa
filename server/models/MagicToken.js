const mongoose = require('mongoose');

const MagicTokenSchema = new mongoose.Schema({
    email: { // Storing email directly to verify strictly, or userId if user exists
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    tokenHashed: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Auto expire documents
MagicTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('MagicToken', MagicTokenSchema);
