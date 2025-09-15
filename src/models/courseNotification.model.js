const mongoose = require("mongoose");

const courseNotificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        order: { type: Number, default: 0 },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    },
    { timestamps: true }
);

const CourseNotification = mongoose.model("CourseNotification", courseNotificationSchema);

module.exports = CourseNotification;
