const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        price: { type: Number, required: true }, // Giá tại thời điểm thêm
        addedAt: { type: Date, default: Date.now }
    }],
    total: { type: Number, default: 0 }, // Tổng giá
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);