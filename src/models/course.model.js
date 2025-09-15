const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },                  /// Tiêu đề khoá học
    slug: { type: String, unique: true },                     /// Slug URL duy nhất
    shortDescription: { type: String },                       /// Mô tả ngắn
    description: { type: String },                            /// Mô tả chi tiết
    thumbnail: String,                                        /// Ảnh đại diện
    originalPrice: {
        type: Number,
        default: 0,
        min: [0, 'Giá gốc không thể âm']
    },
    salePrice: {
        type: Number,
        default: null,
        min: [0, 'Giá khuyến mãi không thể âm'],
        validate: {
            validator: function (value) {
                if (value == null) return true;  // cho phép null
                if (this.originalPrice == null || this.originalPrice === 0) return true;
                return value <= this.originalPrice;
            },
            message: 'Giá khuyến mãi không thể lớn hơn giá gốc'
        }
    },
    saleStart: { type: Date },                                /// Thời gian bắt đầu khuyến mãi
    saleEnd: { type: Date },                                  /// Thời gian kết thúc khuyến mãi

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, /// Danh mục
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],    /// Chủ đề
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],/// Giảng viên

    tags: [{ type: String }],                                /// Từ khoá tìm kiếm
    duration: { type: String },                              /// Thời lượng tổng (vd: "10 giờ")


    requirements: [{ type: String }],                        /// Yêu cầu trước khi học
    includes: [{ type: String }],                            /// Khoá học bao gồm gì (video, quiz…)
    objectives: [{ type: String }],                          /// Mục tiêu đạt được
    audience: [{ type: String }],                            /// Đối tượng học viên
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], /// Khoá học liên quan

    sequentialLearning: { type: Boolean, default: false },   /// true = học theo thứ tự, false = học tự do
    accessDuration: { type: Number, default: null },         /// Số ngày sử dụng (null = vĩnh viễn)

    label: { type: String, default: null }, // Nhãn đơn

    type: {
        type: String,
        enum: ['single', 'combo', 'membership'],             /// single = 1 khoá, combo = nhiều khoá, membership = gói thành viên
        default: 'single'
    },

    isPublished: { type: Boolean, default: false },          /// true = đã public, false = nháp
    status: {
        type: String,
        enum: ['draft', 'coming_soon', 'published', 'free', 'archived'], /// draft: nháp, published: đã phát hành...
        default: 'draft'
    },
}, { timestamps: true });                                    /// Tự động thêm createdAt, updatedAt

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
