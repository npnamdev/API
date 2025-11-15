const Course = require('../models/course.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');
const Item = require('../models/item.model');

// Helper functions for duration calculation
// Removed formatDuration as we now return raw seconds


exports.getAllCourses = async (request, reply) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            sort = 'desc',
            sortBy = 'createdAt',
            isPublished,
            status,
            category,
            topic
        } = request.query;

        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        // Xây dựng query filter
        const query = {};

        // Xử lý search - tìm kiếm trong title, shortDescription, description và tags
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Filter theo isPublished
        if (isPublished !== undefined) {
            query.isPublished = isPublished === 'true' || isPublished === true;
        }

        // Filter theo status
        if (status) {
            query.status = status;
        }

        // Filter theo danh mục
        if (category) {
            query.category = category;
        }

        // Filter theo chủ đề
        if (topic) {
            query.topics = { $in: [topic] };
        }

        // Xử lý sort - Ưu tiên updatedAt mới nhất, rồi createdAt mới nhất
        const sortObj = { updatedAt: -1, createdAt: -1 };

        // Thực hiện query
        const courses = await Course.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort(sortObj)
            .select('title slug shortDescription thumbnail originalPrice salePrice isPublished status category instructors createdAt updatedAt label')
            .populate('instructors', 'fullName avatar')
            .populate('category', 'name slug');

        // Tính totalDuration cho mỗi course
        const coursesWithDuration = await Promise.all(courses.map(async (course) => {
            const chapters = await Chapter.find({ courseId: course._id });
            const chapterIds = chapters.map(ch => ch._id);
            const lessons = await Lesson.find({ chapterId: { $in: chapterIds } }).select("duration type videoUrl");

            // Collect video URLs for type 'video' to fetch durations from Items
            const videoUrls = lessons.filter(lesson => lesson.type === 'video').map(lesson => lesson.videoUrl);
            const items = videoUrls.length > 0 ? await Item.find({ url: { $in: videoUrls } }).select('url duration') : [];
            const itemDurationMap = new Map(items.map(item => [item.url, item.duration]));

            // Assign durations to lessons
            const lessonsWithDuration = lessons.map(lesson => {
                if (lesson.type === 'video' && itemDurationMap.has(lesson.videoUrl)) {
                    lesson.duration = itemDurationMap.get(lesson.videoUrl);
                }
                return lesson;
            });

            const totalSeconds = lessonsWithDuration.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
            return { ...course.toObject(), duration: totalSeconds };
        }));

        const totalCourses = await Course.countDocuments(query);
        const totalPages = Math.ceil(totalCourses / pageSize);

        reply.send({
            status: 'success',
            message: 'Courses retrieved successfully',
            data: coursesWithDuration,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalCourses,
                limit: pageSize,
            },
            filters: {
                search: search || null,
                isPublished: isPublished || null,
                status: status || null,
                category: category || null,
                topic: topic || null,
                sort: 'updatedAt desc, createdAt desc' // Mô tả sort mặc định
            }
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
            .populate("instructors", "fullName")
            .populate("category", "name")
            .populate("topics", "name")
            .populate("relatedCourses", "title");

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

exports.getCourseBySlug = async (req, reply) => {
    try {
        const { slug } = req.params;

        if (!slug) {
            return reply.code(400).send({
                status: 'error',
                message: "Slug is required"
            });
        }

        const course = await Course.findOne({ slug })
            .populate("instructors", "fullName email avatar")
            .populate("category", "name slug")
            .populate("topics", "name slug")
            .populate("relatedCourses", "title slug thumbnail originalPrice salePrice");

        if (!course) {
            return reply.code(404).send({
                status: 'error',
                message: "Course not found"
            });
        }

        // Kiểm tra khóa học có được public không
        // if (!course.isPublished || course.status !== 'published') {
        //     return reply.code(403).send({
        //         status: 'error',
        //         message: "Course is not available"
        //     });
        // }

        const chapters = await Chapter.find({ courseId: course._id }).sort({ order: 1 });

        const chaptersWithLessons = await Promise.all(
            chapters.map(async (chapter) => {
                const lessons = await Lesson.find({ chapterId: chapter._id })
                    .sort({ order: 1 })
                    .select("title order duration videoUrl isPreviewAllowed type");

                // Collect video URLs for type 'video' to fetch durations from Items
                const videoUrls = lessons.filter(lesson => lesson.type === 'video').map(lesson => lesson.videoUrl);
                const items = videoUrls.length > 0 ? await Item.find({ url: { $in: videoUrls } }).select('url duration') : [];
                const itemDurationMap = new Map(items.map(item => [item.url, item.duration]));

                // Assign durations to lessons
                const lessonsWithDuration = lessons.map(lesson => {
                    if (lesson.type === 'video' && itemDurationMap.has(lesson.videoUrl)) {
                        lesson.duration = itemDurationMap.get(lesson.videoUrl);
                    }
                    // Only include videoUrl if preview is allowed
                    if (!lesson.isPreviewAllowed) {
                        lesson.videoUrl = null;
                    }
                    return lesson;
                });

                const totalSeconds = lessonsWithDuration.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

                return {
                    _id: chapter._id,
                    title: chapter.title,
                    description: chapter.description,
                    order: chapter.order,
                    lessonCount: lessons.length,
                    duration: totalSeconds,
                    lessons: lessonsWithDuration,
                };
            })
        );

        // Tính tổng duration của toàn bộ khóa học
        const totalCourseDuration = chaptersWithLessons.reduce((sum, chapter) => sum + (chapter.duration || 0), 0);

        reply.send({
            status: 'success',
            message: 'Course retrieved successfully',
            data: {
                ...course.toObject(),
                duration: totalCourseDuration,
                chapters: chaptersWithLessons,
            }
        });
    } catch (error) {
        console.error(error);
        reply.code(500).send({
            status: 'error',
            message: "Server error"
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

exports.updateCourse = async (req, reply) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedCourse) {
            return reply.code(404).send({ error: "Course not found" });
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
                    duration: oldLesson.duration,
                    type: oldLesson.type,
                    order: oldLesson.order,
                    isPreviewAllowed: oldLesson.isPreviewAllowed,
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


