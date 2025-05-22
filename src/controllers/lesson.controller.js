const Lesson = require('../models/lesson.model');

// Lấy danh sách tất cả bài học
exports.getAllLessons = async (req, reply) => {
    try {
        const lessons = await Lesson.find().populate('course');
        reply.send(lessons);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
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

// Tạo bài học mới
exports.createLesson = async (req, reply) => {
    try {
        const newLesson = new Lesson(req.body);
        const savedLesson = await newLesson.save();
        reply.code(201).send(savedLesson);
    } catch (error) {
        reply.code(400).send({ error: error.message });
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
