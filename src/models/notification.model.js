const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'unread' },
    url: { type: String },
    // targetRoles: [{ type: String, enum: ['admin', 'editor', 'moderator', 'user'], default: ['admin'] }],
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;