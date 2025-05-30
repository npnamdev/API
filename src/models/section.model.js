const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    htmlJson: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

const Section = mongoose.model('Section', sectionSchema);
module.exports = Section;
