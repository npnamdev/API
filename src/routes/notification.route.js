const Notification = require('../models/notification.model');

module.exports = async (fastify, options) => {
    // Lấy danh sách thông báo
    fastify.get('/notifications', async (req, reply) => {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        reply.send(notifications);
    });

    // Tạo thông báo mới
    fastify.post('/notifications', async (req, reply) => {
        const { message, type } = req.body;

        const notification = new Notification({
            message,
            type,
            status: 'unread',
        });

        await notification.save();

        fastify.io.emit('notify', notification);
        reply.send(notification);
    });

    // Đánh dấu đã đọc
    fastify.patch('/notifications/:id/read', async (req, reply) => {
        const { id } = req.params;

        const updated = await Notification.findByIdAndUpdate(
            id,
            { status: 'read' },
            { new: true }
        );

        reply.send(updated);
    });

    // Xóa thông báo
    fastify.delete('/notifications/:id', async (req, reply) => {
        const { id } = req.params;

        const deleted = await Notification.findByIdAndDelete(id);

        fastify.io.emit('deleteNotify', id);
        reply.send(deleted);
    });
};
