const mongoose = require('mongoose');

const ActivationCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true }, // Mã kích hoạt
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Khóa học
    codeType: { type: String, enum: ['single', 'multi'], default: 'single' }, // Loại mã
    quantity: { type: Number, default: 1 }, // Tổng số lượt dùng
    used: { type: Number, default: 0 }, // Đã sử dụng
    expiresAt: { type: Date, required: true }, // Ngày hết hạn
    status: { type: String, enum: ['unused', 'used', 'expired'], default: 'unused' }, // Trạng thái
    usageDays: { type: Number, default: 30 }, // Số ngày học sau khi kích hoạt
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false } // Người tạo
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivationCode', ActivationCodeSchema);
