const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'youtube'], required: true },
  videoUrl: { type: String, required: true },
  duration: { type: String },
  order: Number,
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  isPreviewAllowed: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
