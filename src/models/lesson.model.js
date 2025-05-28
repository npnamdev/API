const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: String,
  content: String,
  videoUrl: String,
  duration: Number,
  order: Number,
  isPreview: { type: Boolean, default: false },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
