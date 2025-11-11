const mongoose = require('mongoose');

const HeroBannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    ctaButtons: [
        {
            text: { type: String, required: true },
            link: { type: String, required: true },
            type: { type: String, enum: ["primary", "outline"], default: "primary" },
            icon: { type: String }, // ví dụ: "Play", "ArrowRight"
        },
    ],
    cards: [
        {
            title: { type: String },
            subtitle: { type: String },
            icon: { type: String }, // "BookOpen", "Star"
            bgColor: { type: String }, // "blue-100", "yellow-100"
            textColor: { type: String },
        },
    ],
    bannerImage: { type: String, required: true },
    badge: { type: String }, // "#1 Nền tảng học tập"
}, { timestamps: true });

module.exports = mongoose.model('HeroBanner', HeroBannerSchema);