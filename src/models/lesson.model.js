const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video', 'youtube'], required: true },
  videoUrl: { type: String, required: true },
  duration: Number,     
  order: Number,
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
