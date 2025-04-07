// const mongoose = require('mongoose');

// const notificationSchema = new mongoose.Schema({
//     message: { type: String, required: true },
//     type: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },  // Các loại thông báo
//     status: { type: String, enum: ['sent', 'pending'], default: 'pending' },  // Trạng thái thông báo
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now }
// });

// // Tạo model từ schema
// const Notification = mongoose.model('Notification', notificationSchema);

// module.exports = Notification;

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, default: 'unread' },  // Có thể là 'unread' hoặc 'read'
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;