const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderCode: { type: String, unique: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }],
        paymentMethod: { type: String, enum: ['cash', 'vnpay', 'momo', 'banking'], required: true, },
        totalPrice: { type: Number, required: true },
        isPaid: { type: Boolean, default: false },
        status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' },
        paymentInfo: {
            transactionId: { type: String },
            paidAt: { type: Date },
            responseData: { type: Object },
        },
    },
    { timestamps: true }
);

orderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        const random = Math.floor(100 + Math.random() * 900); // 3 số random
        const seconds = Math.floor((Date.now() / 1000) % 86400); // số giây trong ngày
        this.orderCode = `ORD-${seconds}${random}`; 
    }
    next();
});

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
