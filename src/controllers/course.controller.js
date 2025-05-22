const Course = require('../models/course.model');

exports.getAllCourses = async (req, reply) => {
    try {
        const courses = await Course.find().populate('instructor').populate('category');
        reply.send(courses);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

// Tạo khóa học mới
exports.createCourse = async (req, reply) => {
    try {
        const newCourse = new Course(req.body);
        const savedCourse = await newCourse.save();
        reply.code(201).send(savedCourse);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Lấy 1 khóa học theo ID
exports.getCourseById = async (req, reply) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor').populate('category');
        if (!course) return reply.code(404).send({ error: 'Course not found' });
        reply.send(course);
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

// Cập nhật khóa học
exports.updateCourse = async (req, reply) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedCourse) return reply.code(404).send({ error: 'Course not found' });
        reply.send(updatedCourse);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Xóa khóa học
exports.deleteCourse = async (req, reply) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return reply.code(404).send({ error: 'Course not found' });
        reply.send({ message: 'Course deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};
