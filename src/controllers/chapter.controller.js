const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');

exports.getChaptersWithLessons = async (req, reply) => {
    try {
        const { courseId } = req.params;

        // Lấy tất cả chapters theo courseId và sắp xếp theo order
        const chapters = await Chapter.find({ courseId }).sort({ order: 1 });

        // Gắn lessons cho từng chapter
        const chaptersWithLessons = await Promise.all(
            chapters.map(async (chapter) => {
                const lessons = await Lesson.find({ chapterId: chapter._id })
                    .sort({ order: 1 })
                    .select('_id title order')
                    .lean(); // chỉ lấy các field cần thiết

                return {
                    _id: chapter._id,
                    title: chapter.title,
                    order: chapter.order,
                    lessons
                };
            })
        );

        return { chapters: chaptersWithLessons };
    } catch (err) {
        console.error(err);
        return reply.status(500).send({ message: 'Server error' });
    }
}


// GET /chapters?courseId=xxx
exports.getAllChapters = async (req, reply) => {
    try {
        const { courseId } = req.query;

        const chapters = await Chapter.find({ courseId });

        reply.send(chapters);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};


// Lấy chương học theo ID
exports.getChapterById = async (req, reply) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate('lessons');
        if (!chapter) return reply.code(404).send({ error: 'Chapter not found' });
        reply.send(chapter);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

// Tạo chương học mới
exports.createChapter = async (req, reply) => {
    try {
        const newChapter = new Chapter(req.body);
        const savedChapter = await newChapter.save();
        reply.code(201).send(savedChapter);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Cập nhật chương học
exports.updateChapter = async (req, reply) => {
    try {
        const updatedChapter = await Chapter.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedChapter) return reply.code(404).send({ error: 'Chapter not found' });
        reply.send(updatedChapter);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Xoá chương học
exports.deleteChapter = async (req, reply) => {
    try {
        const deletedChapter = await Chapter.findByIdAndDelete(req.params.id);
        if (!deletedChapter) return reply.code(404).send({ error: 'Chapter not found' });
        reply.send({ message: 'Chapter deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

exports.deleteChapter = async (req, reply) => {
    try {
        const chapter = await Chapter.findById(req.params.id);
        if (!chapter) return reply.code(404).send({ error: 'Chapter not found' });

        // Xoá tất cả bài học thuộc chương này
        await Lesson.deleteMany({ _id: { $in: chapter.lessons } });

        await Chapter.findByIdAndDelete(req.params.id);
        reply.send({ message: 'Chapter and lessons deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};


exports.updateChapterOrder = async (req, reply) => {
    try {
        const { orders } = req.body;

        const bulkOps = orders.map(item => ({
            updateOne: {
                filter: { _id: item._id },
                update: { order: item.order }
            }
        }));

        await Chapter.bulkWrite(bulkOps);
        reply.send({ message: 'Chapter order updated successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to update order' });
    }
};


exports.createLessonForChapter = async (req, reply) => {
    try {
        const { chapterId, title, slug, content, videoUrl, duration, order, isPreview } = req.body;
        const newLesson = await Lesson.create({
            title,
            slug,
            content,
            videoUrl,
            duration,
            order,
            isPreview
        });

        const updatedChapter = await Chapter.findByIdAndUpdate(
            chapterId,
            { $push: { lessons: newLesson._id } },
            { new: true }
        ).populate('lessons');

        reply.send({ message: 'Lesson created and added to chapter', lesson: newLesson, chapter: updatedChapter });
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Failed to create lesson and assign to chapter' });
    }
};