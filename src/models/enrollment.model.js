const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    progress: { type: Number, default: 0, min: 0, max: 100 }, // Tiến độ học
    completed: { type: Boolean, default: false },             // Đã hoàn thành chưa
    lastAccessed: { type: Date, default: null },              // Lần truy cập gần nhất

    paidAt: { type: Date },                                   // Ngày thanh toán
    expiresAt: { type: Date, default: null },                 // Hạn sử dụng
    enrolledAt: { type: Date, default: Date.now }             // Ngày bắt đầu học
}, {
    timestamps: true
});


const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
