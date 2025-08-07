import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  isCompleted: Boolean,
}, { timestamps: true });

export default mongoose.model('UserProgress', userProgressSchema);

// markLessonCompleted