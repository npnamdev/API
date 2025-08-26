const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderCode: { type: String, unique: true }, // Mã đơn ngắn gọn để tra cứu
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],

        // Tổng tiền gốc
        totalAmount: { type: Number, required: true },

        // Mã giảm giá (nếu có)
        couponCode: { type: String },        // Mã được áp dụng
        discountAmount: { type: Number },    // Số tiền giảm
        finalAmount: { type: Number },       // Số tiền cuối cùng phải trả

        // Phương thức thanh toán
        paymentMethod: { type: String, enum: ['cash', 'bank'], required: true },

        // Trạng thái đơn hàng
        paymentStatus: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' }
        // status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
    },
    { timestamps: true }
);

orderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.orderCode = `ORD-${random}`;
    }
    next();
});

// orderSchema.pre('save', function (next) {
//     if (!this.orderCode) {
//         const random = Math.floor(100 + Math.random() * 900); // 3 số random
//         const seconds = Math.floor((Date.now() / 1000) % 86400); // số giây trong ngày
//         this.orderCode = `ORD-${seconds}${random}`;
//     }
//     next();
// });

// Cấp quyền học khi đơn hàng completed
// orderSchema.post('findOneAndUpdate', async function (doc) {
//   if (doc && doc.status === 'completed') {
//     const Enrollment = require('./enrollment.model');
//     for (const courseId of doc.courses) {
//       const exists = await Enrollment.findOne({ user: doc.user, course: courseId });
//       if (!exists) {
//         await Enrollment.create({ user: doc.user, course: courseId });
//       }
//     }
//   }
// });

module.exports = mongoose.model('Order', orderSchema);
