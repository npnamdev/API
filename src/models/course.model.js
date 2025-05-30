const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Tiêu đề khóa học
    slug: { type: String, unique: true }, // Đường dẫn thân thiện (slug) dùng để SEO
    description: String, // Mô tả khóa học chung
    shortDescription: String, // Mô tả ngắn: xuất hiện dưới tiêu đề khóa học để tóm tắt nhanh
    thumbnail: String, // Ảnh thumbnail nhỏ (ảnh đại diện khóa học)
    largeThumbnail: String, // Ảnh thumbnail lớn dùng trang chi tiết khóa học (ảnh lớn hơn ảnh thumbnail nhỏ)
    price: {
        type: Number,
        default: 0,
        min: [0, 'Giá khóa học không thể âm'],
    }, // Giá khóa học
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Giảm giá không thể âm'],
        validate: {
            validator: function (value) {
                // this.price là giá hiện tại của document
                return value <= this.price;
            },
            message: 'Giảm giá không thể lớn hơn giá khóa học',
        }
    }, // Giảm giá (nếu có)
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }], // Chủ đề khóa học (một khóa có thể có nhiều chủ đề)
    type: { type: String, enum: ['single', 'combo', 'membership'], default: 'single' }, // Loại khóa học: đơn, combo, membership
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }, // Trình độ khóa học
    language: { type: String, default: 'English' }, // Ngôn ngữ giảng dạy
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // Giảng viên (có thể nhiều người)
    instructorTitle: { type: String, default: 'Giảng viên' }, // Danh xưng hiển thị giảng viên (ví dụ: Diễn giả, Tác giả)
    tags: [String], // Tags (từ khóa)
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Học viên đã đăng ký
    isPublished: { type: Boolean, default: false }, // Trạng thái xuất bản
    status: { type: String, enum: ['draft', 'coming_soon', 'published', 'free', 'archived'], default: 'draft' }, // Trạng thái khóa học
    accessDuration: { type: Number, default: null }, // Thời gian truy cập khóa học (ngày)
    durationText: String, // Thời lượng khóa học nhập theo dạng text (vd: 4 giờ, 30 ngày, 2 tuần)
    trailerVideo: String, // Link video giới thiệu/trailer khóa học
    materialsLink: String, // Link tài liệu tham khảo (lấy từ thư viện media)
    badge: {
        type: { type: String, enum: ['none', 'popular', 'best_seller', 'new', 'discount', 'hot', 'recommended'], default: 'none' },
        text: { type: String, default: '' },
        color: { type: String, default: '' }
    }, // Badge khóa học (như: phổ biến, bán chạy,...)
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }], // Danh sách chương khóa học
    courseContentTitle: { type: String, default: 'Nội dung khóa học' }, // Tiêu đề hiển thị cho phần nội dung khóa học
    courseContent: { type: String }, // Nội dung khóa học dạng string (mô tả chi tiết hoặc đoạn giới thiệu)
    requirements: { type: String }, // Yêu cầu để học khóa học (liệt kê các điều kiện)

    // Mục tiêu khóa học: mảng các object gồm text mô tả và icon
    learningObjectives: [{
        text: { type: String, required: true },
        icon: { type: String }
    }],

    // Học liệu khóa học: mảng các object gồm text và icon (ví dụ: thời lượng, số chương, bài giảng, tài liệu, hỗ trợ PC/tablet/mobile, chứng chỉ)
    learningMaterials: [{
        text: { type: String, required: true },
        icon: { type: String }
    }],

    // Mô tả chi tiết khóa học giúp khách hàng hiểu rõ về nội dung, phương pháp học và cập nhật khóa học
    detailedDescription: { type: String },

    // Đối tượng khóa học: mảng object gồm text và icon, liệt kê nhóm người phù hợp với khóa học
    targetAudiences: [{
        text: { type: String, required: true },
        icon: { type: String }
    }],

    studentProgress: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Học viên
        progress: { type: Number, default: 0, min: 0, max: 100 }, // Tiến trình học (%)
        completed: { type: Boolean, default: false }, // Trạng thái hoàn thành khóa học
        lastAccessed: { type: Date, default: null }, // Lần truy cập cuối cùng
        watchedVideos: [{ type: String }], // Danh sách ID hoặc đường dẫn các video đã xem
        updatedAt: { type: Date, default: Date.now } // Thời điểm cập nhật trạng thái
    }],

    // SEO Metadata fields
    metaTitle: { type: String }, // Tiêu đề SEO
    metaDescription: { type: String }, // Mô tả SEO
    metaKeywords: [String], // Từ khóa SEO

}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
