const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: String,
  content: String,
  videoUrl: String,
  duration: Number,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  order: Number,
  isPreview: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);
