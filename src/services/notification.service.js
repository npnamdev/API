const Notification = require('../models/notification.model');

exports.createNotification = async (message, type) => {
    const notification = new Notification({
        message,
        type
    });
    return await notification.save();
};

exports.getNotifications = async () => {
    return await Notification.find().sort({ createdAt: -1 });
};