const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    faqs: [
        {
            question: { type: String, required: true },
            answer: { type: String, required: true },
            order: { type: Number, default: 0 },
            isActive: { type: Boolean, default: true }
        }
    ],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Faq', FaqSchema);