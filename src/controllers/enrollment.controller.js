const Enrollment = require('../models/enrollment.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');
const LessonProgress = require('../models/lessonProgress.model');

exports.getMyCourses = async (req, reply) => {
  try {
    // Lấy userId từ req.user (đảm bảo middleware xác thực JWT/session đã gán req.user)
    const userId = req.user.id;

    if (!userId) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }

    // Lấy tất cả enrollment của user
    const enrollments = await Enrollment.find({ user: userId }).populate('course');

    const results = await Promise.all(enrollments.map(async (enrollment) => {
      const courseId = enrollment.course._id;

      // Lấy tất cả chapter của course
      const chapters = await Chapter.find({ course: courseId }).select('_id');
      const chapterIds = chapters.map(c => c._id);

      // Lấy tất cả lesson của các chapter
      const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).select('_id');
      const lessonIds = lessons.map(l => l._id);

      const totalLessons = lessonIds.length;

      // Lấy số bài đã hoàn thành của user
      const completedLessons = await LessonProgress.countDocuments({
        user: userId,
        lesson: { $in: lessonIds },
        completed: true
      });

      // Tính progress %
      const progress = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;

      return {
        course: enrollment.course,
        enrolledAt: enrollment.enrolledAt,
        progress,
        expiresAt: enrollment.expiresAt
      };
    }));

    return reply.send(results);

  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};

// Tạo enrollment mới
exports.createEnrollment = async (req, reply) => {
  try {
    const { user, course, expiresAt } = req.body;

    const newEnrollment = await Enrollment.create({ user, course, expiresAt });
    return reply.code(201).send(newEnrollment);
  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};

// Lấy tất cả enrollment
exports.getAllEnrollments = async (req, reply) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('user', 'name email')
      .populate('course', 'title price');
    return reply.send(enrollments);
  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};

// Lấy enrollment theo userId
exports.getEnrollmentsByUser = async (req, reply) => {
  try {
    const { userId } = req.params;
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title description price')
      .select('course enrolledAt progress expiresAt');
    return reply.send(enrollments);
  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};

// Cập nhật tiến trình học
exports.updateProgress = async (req, reply) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;

    const updated = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { progress },
      { new: true }
    );
    return reply.send(updated);
  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};

// Xoá enrollment
exports.deleteEnrollment = async (req, reply) => {
  try {
    const { enrollmentId } = req.params;
    await Enrollment.findByIdAndDelete(enrollmentId);
    return reply.send({ message: 'Enrollment deleted' });
  } catch (err) {
    return reply.code(500).send({ message: 'Server error', error: err.message });
  }
};