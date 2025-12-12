const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true // e.g., 'global_config'
    },
    registration_deadline: {
        type: Date,
        default: null
    },
    pairing_done: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
