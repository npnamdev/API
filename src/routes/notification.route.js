const notificationController = require('../controllers/notification.controller');

async function notificationRoutes(fastify) {
    fastify.get('/notifications', notificationController.getNotifications);
    fastify.post('/notifications', notificationController.createNotification);
    fastify.patch('/notifications/:id/read', notificationController.markAsRead);
    fastify.delete('/notifications/:id', notificationController.deleteNotification);
    fastify.patch('/notifications/read-all', notificationController.markAllAsRead);
}

module.exports = notificationRoutes;