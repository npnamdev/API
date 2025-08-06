const Lesson = require('../models/lesson.model');
const getYoutubeDuration = require('../utils/youtobe');

// Lấy danh sách tất cả bài học
exports.getAllLessons = async (req, reply) => {
    try {
        const lessons = await Lesson.find();
        reply.send(lessons);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

exports.createLesson = async (req, res) => {
    try {
        const { title, type, videoUrl } = req.body;

        let duration = null;

        if (type === 'youtube') {
            duration = await getYoutubeDuration(videoUrl); // gọi API luôn
        }

        const lesson = new Lesson({
            title,
            type,
            videoUrl,
            duration, // lưu duration vào DB
        });

        await lesson.save();

        res.code(201).send(lesson);
    } catch (err) {
        res.code(500).send({ message: err.message });
    }
};

// Lấy bài học theo ID
exports.getLessonById = async (req, reply) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate('course');
        if (!lesson) return reply.code(404).send({ error: 'Lesson not found' });
        reply.send(lesson);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};



// Cập nhật bài học
exports.updateLesson = async (req, reply) => {
    try {
        const updatedLesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedLesson) return reply.code(404).send({ error: 'Lesson not found' });
        reply.send(updatedLesson);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Xoá bài học
exports.deleteLesson = async (req, reply) => {
    try {
        const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
        if (!deletedLesson) return reply.code(404).send({ error: 'Lesson not found' });
        reply.send({ message: 'Lesson deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};


exports.updateLessonOrder = async (req, reply) => {
    try {
        const { orders } = req.body; // [{ _id: 'lessonId1', order: 0 }, ...]

        const bulkOps = orders.map(item => ({
            updateOne: {
                filter: { _id: item._id },
                update: { order: item.order }
            }
        }));

        await Lesson.bulkWrite(bulkOps);
        reply.send({ message: 'Lesson order updated successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Failed to update lesson order' });
    }
}
