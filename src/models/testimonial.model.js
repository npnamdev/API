const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    testimonials: [
        {
            name: { type: String, required: true },
            role: { type: String, required: true },
            avatar: { type: String, required: true },
            content: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, default: 5 },
            course: { type: String, required: true }
        }
    ],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);