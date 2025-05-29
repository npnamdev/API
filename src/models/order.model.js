const mongoose = require('mongoose');

// Khai báo schema cho đơn hàng
const orderSchema = new mongoose.Schema({
    // Mã đơn hàng duy nhất, dùng để tra cứu, hiển thị, hoặc gửi cho bên thứ ba
    orderCode: {
        type: String,
        required: true,
        unique: true, // Không được trùng nhau
    },

    // Người dùng thực hiện đơn hàng (liên kết với bảng User)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Danh sách các khóa học trong đơn hàng
    courses: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // ID khóa học
            title: { type: String, required: true },  // Tiêu đề khóa học (để lưu lại nếu khóa học bị xóa)
            price: { type: Number, required: true },  // Giá từng khóa học
        },
    ],

    // Phương thức thanh toán: tiền mặt, VNPAY, Momo hoặc ngân hàng
    paymentMethod: {
        type: String,
        enum: ['cash', 'vnpay', 'momo', 'banking'],
        required: true,
    },

    // Kết quả thanh toán từ cổng thanh toán (nếu có)
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },

    // Tổng tiền của đơn hàng
    totalPrice: { type: Number, required: true },

    // Trạng thái thanh toán
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    // Trạng thái cấp quyền truy cập khóa học
    isAccessGranted: { type: Boolean, default: false },
    accessGrantedAt: { type: Date },

    // Trạng thái xử lý đơn hàng
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
});

// Tự động tạo mã đơn hàng nếu chưa có khi lưu
orderSchema.pre('save', function (next) {
    if (!this.orderCode) {
        this.orderCode = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
