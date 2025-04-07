const Notification = require('../models/notification.model');

// Tạo thông báo mới
exports.createNotification = async (message, type) => {
    const notification = new Notification({
        message,
        type
    });
    return await notification.save();
};

// Lấy tất cả thông báo
exports.getNotifications = async () => {
    return await Notification.find().sort({ createdAt: -1 });
};

// Xóa thông báo
exports.deleteNotification = async (id) => {
    return await Notification.findByIdAndDelete(id);
};