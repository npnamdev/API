const mongoose = require('mongoose');

function generateCode(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const ActivationCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    codeType: { type: String, enum: ['single', 'multi'], default: 'single' },
    quantity: { type: Number, default: 1 },
    used: { type: Number, default: 0 },
    usageDays: { type: Number, default: 30 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, {
    timestamps: true
});

// 🔥 Tự động sinh mã nếu chưa có
ActivationCodeSchema.pre('validate', function (next) {
    if (!this.code) {
        this.code = generateCode(10); // độ dài 10 ký tự
    }
    next();
});

// Giữ quantity = 1 nếu là single
ActivationCodeSchema.pre('save', function (next) {
    if (this.codeType === 'single') {
        this.quantity = 1;
    }
    next();
});

module.exports = mongoose.model('ActivationCode', ActivationCodeSchema);
