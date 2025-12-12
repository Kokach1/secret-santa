const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    visible_to: {
        type: String,
        enum: ['students', 'admin', 'all'],
        default: 'students'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
