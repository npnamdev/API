const Notification = require('../models/notification.model');

exports.getNotifications = async (req, reply) => {
    try {
        const { page = 1, limit = 50, search = '', sort = 'desc', status } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.min(30, Math.max(1, parseInt(limit)));
        const skip = (pageNumber - 1) * pageSize;
        const sortOrder = sort === 'asc' ? 1 : -1;

        const searchQuery = {
            ...(search ? { message: { $regex: search, $options: 'i' } } : {}),
            ...(status === 'read' || status === 'unread' ? { status } : {}),
        };

        const notifications = await Notification.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder });

        const total = await Notification.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / pageSize);

        const unreadCount = await Notification.countDocuments({ status: 'unread' });
        reply.send({
            status: 'success',
            message: 'Notifications retrieved successfully',
            data: notifications,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalItems: total,
                limit: pageSize,
            },
            unreadCount,
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.createNotification = async (req, reply) => {
    try {
        const { message, type } = req.body;

        if (!message || !type) {
            return reply.code(400).send({ status: 'error', message: 'Message and type are required' });
        }

        const notification = new Notification({ message, type, status: 'unread' });
        await notification.save();
        req.server.io.emit('notify', notification);

        reply.send({ status: 'success', message: 'Notification created successfully', data: notification });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

exports.markAsRead = async (req, reply) => {
    try {
        const { id } = req.params;
        const updated = await Notification.findByIdAndUpdate(id, { status: 'read' }, { new: true });
        if (!updated) {
            return reply.code(404).send({ status: 'error', message: 'Notification not found' });
        }

        req.server.io.emit('markAsRead', { id });

        reply.send({ status: 'success', message: 'Notification marked as read', data: updated });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message || 'Internal Server Error' });
    }
};

exports.deleteNotification = async (req, reply) => {
    try {
        const { id } = req.params;

        const deleted = await Notification.findByIdAndDelete(id);

        if (!deleted) {
            return reply.code(404).send({ status: 'error', message: 'Notification not found' });
        }

        req.server.io.emit('deleteNotify', id);
        reply.send({ status: 'success', message: 'Notification deleted successfully', data: deleted });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message || 'Internal Server Error' });
    }
};

exports.markAllAsRead = async (req, reply) => {
    try {
        const result = await Notification.updateMany(
            { status: 'unread' },
            { $set: { status: 'read' } }
        );

        reply.send({
            status: 'success',
            message: 'Tất cả thông báo đã được đánh dấu là đã đọc',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};
