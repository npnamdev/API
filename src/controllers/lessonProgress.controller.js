const LessonProgress = require('../models/lessonProgress.model');

// Đánh dấu bài học là đã hoàn thành
exports.markLessonAsCompleted = async (req, res) => {
  try {
    const { userId, lessonId } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({ message: 'userId và lessonId là bắt buộc.' });
    }

    // Cập nhật hoặc tạo mới nếu chưa tồn tại
    const progress = await LessonProgress.findOneAndUpdate(
      { userId, lessonId },
      { isCompleted: true },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Đã đánh dấu hoàn thành.', data: progress });
  } catch (error) {
    console.error('Lỗi khi đánh dấu bài học:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.', error });
  }
};

// Lấy danh sách bài học đã hoàn thành của người dùng
exports.getCompletedLessonsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const completedLessons = await LessonProgress.find({
      userId,
      isCompleted: true,
    }).populate('lessonId');

    res.status(200).json({ data: completedLessons });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài học đã hoàn thành:', error);
    res.status(500).json({ message: 'Lỗi máy chủ.', error });
  }
};
