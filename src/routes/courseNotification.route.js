const courseAnnouncementController = require("../controllers/courseNotification.controller");

async function routes(fastify, options) {
    fastify.post("/announcements", courseAnnouncementController.createNotification);
    fastify.get("/courses/:courseId/announcements", courseAnnouncementController.getNotificationsByCourse);
    fastify.put("/announcements/:id", courseAnnouncementController.updateNotification);
    fastify.delete("/announcements/:id", courseAnnouncementController.deleteNotification);

    fastify.put("/courses/:courseId/announcements/reorder", courseAnnouncementController.reorderNotifications);
}

module.exports = routes;
