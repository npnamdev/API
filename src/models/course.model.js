const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: String,
    thumbnail: String,
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    language: { type: String, default: 'English' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    tags: [String],
    studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublished: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'coming_soon', 'published', 'free', 'archived'], default: 'draft' },
    accessDuration: { type: Number, default: null },
    badge: {
        type: { type: String, enum: ['none', 'popular', 'best_seller', 'new', 'discount', 'hot', 'recommended'], default: 'none' },
        text: { type: String, default: '' },
        color: { type: String, default: '' }
    }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
