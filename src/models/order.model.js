// models/order.model.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Mã đơn hàng duy nhất, dùng để tra cứu, hiển thị hoặc gửi cho bên thứ ba
    orderCode: { type: String, unique: true },

    // Người dùng thực hiện đơn hàng (liên kết với bảng User)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Mảng các khóa học trong đơn hàng, chỉ lưu ObjectId khóa học, thông tin chi tiết lấy bằng populate
    courses: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
    ],

    // Phương thức thanh toán: tiền mặt, VNPAY, Momo hoặc thanh toán qua ngân hàng
    paymentMethod: {
        type: String,
        enum: ['cash', 'vnpay', 'momo', 'banking'],
        required: true,
    },

    // Kết quả thanh toán trả về từ cổng thanh toán (nếu có)
    paymentResult: {
        id: String,          // Mã giao dịch thanh toán
        status: String,      // Trạng thái thanh toán (vd: success, failed)
        update_time: String, // Thời gian cập nhật trạng thái thanh toán
        email_address: String, // Email người dùng thanh toán (nếu có)
    },

    // Tổng số tiền của đơn hàng, tính dựa trên các khóa học đã mua
    totalPrice: { type: Number, required: true },

    // Trạng thái đã thanh toán hay chưa
    isPaid: { type: Boolean, default: false },

    // Thời điểm thanh toán (nếu đã thanh toán)
    paidAt: { type: Date },

    // Trạng thái đã cấp quyền truy cập khóa học hay chưa
    isAccessGranted: { type: Boolean, default: false },

    // Thời điểm cấp quyền truy cập khóa học
    accessGrantedAt: { type: Date },

    // Trạng thái xử lý đơn hàng
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'], // trạng thái có thể là chờ xử lý, đang xử lý, hoàn thành hoặc hủy
        default: 'pending',
    },
}, {
    timestamps: true, // Tự động tạo các trường createdAt và updatedAt
});

// Tự động tạo mã đơn hàng nếu chưa có khi lưu
orderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        this.orderCode = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
