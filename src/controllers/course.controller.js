const Course = require('../models/course.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');


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
            // .select('title thumbnail type isPublished status createdAt updateAt')
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder })
            .populate('topics')
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


exports.getCourseById = async (req, reply) => {
    try {
        const { id } = req.params;

        if (!id) {
            return reply.code(400).send({ error: "Invalid course ID" });
        }

        const course = await Course.findById(id)
            .populate("instructors", "name avatar")
            .populate("category", "name")
            .populate("topics", "name");

        if (!course) {
            return reply.code(404).send({ error: "Course not found" });
        }

        const chapters = await Chapter.find({ courseId: course._id }).sort({ order: 1 });

        const chaptersWithLessonCount = await Promise.all(
            chapters.map(async (chapter) => {
                const lessons = await Lesson.find({ chapterId: chapter._id })
                    .sort({ order: 1 })
                    .select("title order");

                return {
                    _id: chapter._id,
                    title: chapter.title,
                    order: chapter.order,
                    lessonCount: lessons.length,
                    lessons,
                };
            })
        );

        reply.send({
            ...course.toObject(),
            chapters: chaptersWithLessonCount,
        });
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
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

exports.updateCourse = async (req, reply) => {
    try {
        const data = { ...req.body };

        // Nếu originalPrice hoặc salePrice không tồn tại hoặc rỗng → set về 0
        if (data.originalPrice === undefined || data.originalPrice === "") {
            data.originalPrice = 0;
        }
        if (data.salePrice === undefined || data.salePrice === "") {
            data.salePrice = 0;
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });

        if (!updatedCourse) {
            return reply.code(404).send({ error: 'Course not found' });
        }

        reply.send(updatedCourse);
    } catch (error) {
        reply.code(400).send({ error: error.message });
    }
};

exports.deleteCourse = async (req, reply) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) return reply.code(404).send({ error: 'Course not found' });
        reply.send({ message: 'Course deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

exports.duplicateCourse = async (req, reply) => {
    try {
        const courseId = req.params.id;

        const course = await Course.findById(courseId)
            .populate({ path: 'category', select: '_id' })
            .populate({ path: 'instructors', select: '_id' });

        if (!course) {
            return reply.code(404).send({ message: 'Course not found' });
        }

        const newCourse = new Course({
            title: course.title + ' (Copy)',
            slug: course.slug + '-' + Date.now(), // Tạo slug mới tránh trùng
            description: course.description,
            thumbnail: course.thumbnail,
            price: course.price,
            discount: course.discount,
            category: course.category?._id || null,
            level: course.level,
            language: course.language,
            instructors: course.instructors.map(i => i._id),
            tags: course.tags,
            isPublished: false,
            status: 'draft',
            accessDuration: course.accessDuration,
            badge: course.badge,
            chapters: [], // sẽ cập nhật sau
        });

        await newCourse.save();

        // ✅ Clone Chapter & Lesson
        const oldChapters = await Chapter.find({ courseId }).sort({ order: 1 });
        const chapterMap = new Map();

        for (const oldChapter of oldChapters) {
            const newChapter = new Chapter({
                courseId: newCourse._id,
                title: oldChapter.title,
                description: oldChapter.description,
                order: oldChapter.order,
            });
            await newChapter.save();
            chapterMap.set(oldChapter._id.toString(), newChapter._id);

            // Clone bài học (lessons) trong chapter đó
            const oldLessons = await Lesson.find({ chapterId: oldChapter._id });
            for (const oldLesson of oldLessons) {
                const newLesson = new Lesson({
                    chapterId: newChapter._id,
                    title: oldLesson.title,
                    content: oldLesson.content,
                    videoUrl: oldLesson.videoUrl,
                    order: oldLesson.order,
                });
                await newLesson.save();
            }

            newCourse.chapters.push(newChapter._id);
        }

        await newCourse.save();

        return reply.send({ message: 'Course duplicated successfully', course: newCourse });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: 'Internal server error' });
    }
};

exports.getCourseFullDetail = async (req, reply) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId)
            .populate({ path: 'category', select: 'name' })
            .populate({ path: 'instructors', select: 'fullName' });

        if (!course) {
            return reply.code(404).send({ message: 'Course not found' });
        }

        const chapters = await Chapter.find({ courseId }).sort({ order: 1 });
        const chapterIds = chapters.map(ch => ch._id);
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds } }).sort({ order: 1 });

        const fullChapters = chapters.map(ch => ({
            ...ch.toObject(),
            lessons: lessons.filter(lesson => lesson.chapterId.toString() === ch._id.toString())
        }));

        return reply.send({
            ...course.toObject(),
            chapters: fullChapters
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ message: 'Internal server error' });
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


