const CourseNotification = require("../models/courseNotification.model");

// Tạo mới thông báo
exports.createNotification = async (req, reply) => {
    try {
        const { courseId, title, content } = req.body;

        if (!courseId) {
            return reply.code(400).send({ error: "courseId is required" });
        }

        const lastNotification = await CourseNotification.findOne({ courseId })
            .sort("-order")
            .lean();

        const nextOrder = lastNotification ? lastNotification.order + 1 : 1;

        const notification = new CourseNotification({
            courseId,
            title,
            content,
            order: nextOrder,
        });

        await notification.save();
        reply.code(201).send(notification);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

// Lấy tất cả thông báo của 1 khoá học
exports.getNotificationsByCourse = async (req, reply) => {
    try {
        const { courseId } = req.params;
        const notifications = await CourseNotification.find({ courseId }).sort("order");
        reply.send(notifications);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};

// Cập nhật thông báo
exports.updateNotification = async (req, reply) => {
    try {
        const notification = await CourseNotification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!notification) return reply.code(404).send({ error: "Notification not found" });
        reply.send(notification);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

// Xoá thông báo
exports.deleteNotification = async (req, reply) => {
    try {
        const notification = await CourseNotification.findByIdAndDelete(req.params.id);
        if (!notification) return reply.code(404).send({ error: "Notification not found" });
        reply.send({ message: "Notification deleted" });
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};

// Đổi vị trí order của nhiều thông báo
exports.reorderNotifications = async (req, reply) => {
    try {
        const { courseId, notifications } = req.body;
        // notifications: [{ id: "xxx", order: 1 }, { id: "yyy", order: 2 }]

        if (!courseId || !Array.isArray(notifications)) {
            return reply.code(400).send({ error: "courseId and notifications array are required" });
        }

        const bulkOps = notifications.map((n) => ({
            updateOne: {
                filter: { _id: n.id, courseId },
                update: { $set: { order: n.order } },
            },
        }));

        await CourseNotification.bulkWrite(bulkOps);

        const updated = await CourseNotification.find({ courseId }).sort("order");
        reply.send(updated);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};
