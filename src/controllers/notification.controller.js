const Notification = require('../models/notification.model');

const getNotifications = async (req, reply) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    reply.send(notifications);
};

const createNotification = async (req, reply) => {
    const { message, type } = req.body;

    const notification = new Notification({
        message,
        type,
        status: 'unread',
    });

    await notification.save();

    req.server.io.emit('notify', notification); // Lưu ý: dùng `req.server` để truy cập Fastify instance
    reply.send(notification);
};

const markAsRead = async (req, reply) => {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(
        id,
        { status: 'read' },
        { new: true }
    );

    reply.send(updated);
};

const deleteNotification = async (req, reply) => {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    req.server.io.emit('deleteNotify', id);
    reply.send(deleted);
};

module.exports = {
    getNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
};