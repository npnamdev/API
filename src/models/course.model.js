const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    thumbnail: String,
    price: { type: Number, default: 0, min: [0, 'Giá khóa học không thể âm'] },
    discount: {
        type: Number, default: 0, min: [0, 'Giảm giá không thể âm'],
        validate: { validator: function (value) { return value <= this.price; }, message: 'Giảm giá không thể lớn hơn giá khóa học' }
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
    topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    tags: [String],

    type: { type: String, enum: ['single', 'combo', 'membership'], default: 'single' },

    isPublished: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'coming_soon', 'published', 'free', 'archived'], default: 'draft' },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
