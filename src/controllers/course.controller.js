const Course = require('../models/course.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');

// exports.getCourseFullDetail = async (req, reply) => {
//     try {
//         const courseId = req.params.id;

//         const course = await Course.findById(courseId);
//         if (!course) return reply.code(404).send({ message: 'Course not found' });

//         const chapters = await Chapter.find({ courseId: courseId });
//         const chapterIds = chapters.map(ch => ch._id);

//         const lessons = await Lesson.find({ chapterId: { $in: chapterIds } });
//         const fullChapters = chapters.map(ch => ({
//             ...ch.toObject(),
//             lessons: lessons.filter(lesson => lesson.chapterId.toString() === ch._id.toString())
//         }));

//         return reply.send({
//             ...course.toObject(),
//             chapters: fullChapters
//         });

//     } catch (error) {
//         console.error(error);
//         return reply.code(500).send({ message: 'Internal server error' });
//     }
// };

exports.getCourseFullDetail = async (req, reply) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return reply.code(404).send({ message: 'Course not found' });
        }

        // Lấy danh sách chương, sắp xếp theo 'order'
        const chapters = await Chapter.find({ courseId }).sort({ order: 1 });

        // Lấy ID các chương
        const chapterIds = chapters.map(ch => ch._id);

        // Lấy danh sách bài học, sắp xếp theo 'order'
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 });

        // Gộp bài học vào từng chương
        const fullChapters = chapters.map(ch => ({
            ...ch.toObject(),
            lessons: lessons
                .filter(lesson => lesson.chapterId.toString() === ch._id.toString())
        }));

        // Trả về dữ liệu đầy đủ
        return reply.send({
            ...course.toObject(),
            chapters: fullChapters
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: 'Internal server error' });
    }
};

exports.getAllCourses = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'desc' } = request.query;
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        const searchQuery = search
            ? { title: { $regex: search, $options: 'i' } }
            : {};

        const sortOrder = sort === 'asc' ? 1 : -1;
        const courses = await Course.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder })
            .populate('instructors')
            .populate('category');

        const totalCourses = await Course.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalCourses / pageSize);

        reply.send({
            status: 'success',
            message: 'Courses retrieved successfully',
            data: courses,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalCourses,
                limit: pageSize,
            },
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message || 'Server error',
        });
    }
};


exports.createCourse = async (req, reply) => {
    try {
        const newCourse = new Course(req.body);
        const savedCourse = await newCourse.save();
        reply.code(201).send(savedCourse);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.createManyCourses = async (req, reply) => {
    try {
        const courses = req.body;

        if (!Array.isArray(courses) || courses.length === 0) {
            return reply.code(400).send({ error: 'Request body must be a non-empty array of courses' });
        }

        const createdCourses = await Course.insertMany(courses);
        reply.code(201).send(createdCourses);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

// Lấy 1 khóa học theo ID, có populate chương học và bài học
exports.getCourseById = async (req, reply) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructors')
            .populate('category');

        if (!course) return reply.code(404).send({ error: 'Course not found' });

        reply.send(course);
    } catch (error) {
        console.error(error);
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

