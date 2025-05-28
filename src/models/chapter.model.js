const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
    title: { type: String, required: true },
    lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chapter', chapterSchema);
