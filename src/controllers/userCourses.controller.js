// Import các model cần thiết
import Enrollment from '../models/enrollment.model.js'; // Model lưu thông tin đăng ký khoá học của người dùng
import Chapter from '../models/chapter.model.js';       // Model chương học (mỗi khoá học có nhiều chương)
import Lesson from '../models/lesson.model.js';         // Model bài học (mỗi chương có nhiều bài)
import UserProgress from '../models/UserProgress.model.js'; // Model tiến độ học tập của người dùng

// API: Lấy danh sách các khoá học mà người dùng đã đăng ký, kèm tiến độ học của từng khoá
export const getUserCoursesWithProgress = async (req, reply) => {
    // Lấy userId từ URL params
    const { userId } = req.params;

    // Tìm tất cả các khoá học mà người dùng này đã đăng ký (enrollment)
    // Kèm theo thông tin chi tiết của khoá học thông qua .populate('courseId')
    const enrollments = await Enrollment.find({ userId }).populate('courseId');

    // Tạo mảng chứa kết quả trả về
    const result = [];

    // Lặp qua từng khoá học đã đăng ký
    for (const enrollment of enrollments) {
        const course = enrollment.courseId; // Lấy thông tin chi tiết của khoá học

        // Tìm tất cả các chương thuộc khoá học này
        const chapters = await Chapter.find({ courseId: course._id });

        // Lấy danh sách chapterId để truy vấn bài học
        const chapterIds = chapters.map(c => c._id);

        // Tìm tất cả các bài học thuộc các chương của khoá học
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds } });

        // Tổng số bài học trong khoá học
        const totalLessons = lessons.length;

        // Lấy danh sách lessonId để truy vấn tiến độ
        const lessonIds = lessons.map(l => l._id);

        // Đếm số bài học mà người dùng đã hoàn thành
        const completedLessons = await UserProgress.countDocuments({
            userId,                          // của người dùng này
            lessonId: { $in: lessonIds },    // trong danh sách bài học của khoá này
            isCompleted: true                // và đã hoàn thành
        });

        // Tính phần trăm tiến độ học
        const progress = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // Thêm kết quả cho khoá học này vào mảng kết quả chung
        result.push({
            courseId: course._id,  // ID khoá học
            title: course.title,   // Tiêu đề khoá học
            progress               // Tiến độ học (0–100%)
        });
    }

    // Trả về danh sách các khoá học + tiến độ
    return reply.send(result);
};
