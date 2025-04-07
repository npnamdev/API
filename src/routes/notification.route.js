const { createNotification, getNotifications, deleteNotification } = require('../controllers/notification.controller');

module.exports = async (fastify, options) => {
    // Lấy danh sách thông báo
    fastify.get('/notifications', async (req, reply) => {
        const notifications = await getNotifications();
        reply.send(notifications);
    });

    // Tạo thông báo mới
    fastify.post('/notifications', async (req, reply) => {
        const { message, type } = req.body;
        const notification = await createNotification(message, type);

        // Gửi thông báo đến tất cả client qua Socket.IO
        fastify.io.emit('notify', notification);  // Sự kiện "notify"

        reply.send(notification);
    });

    // Xóa thông báo
    fastify.delete('/notifications/:id', async (req, reply) => {
        const { id } = req.params;
        const deletedNotification = await deleteNotification(id);

        // Gửi thông báo xóa đến tất cả client qua Socket.IO
        fastify.io.emit('deleteNotify', id);  // Sự kiện "deleteNotify"

        reply.send(deletedNotification);
    });
};