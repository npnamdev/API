import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Lesson' },
    completed: { type: Boolean, default: false },
}, { timestamps: true });

userProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model('UserProgress', userProgressSchema);
