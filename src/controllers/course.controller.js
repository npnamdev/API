const Course = require('../models/course.model');
const Chapter = require('../models/chapter.model');
const Lesson = require('../models/lesson.model');
const Item = require('../models/item.model');
const mongoose = require('mongoose');


exports.getAllCourses = async (request, reply) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            isPublished,
            status,
            category,
            topic,
        } = request.query;

        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;
        const query = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { shortDescription: regex },
                { description: regex },
                { tags: { $in: [regex] } },
            ];
        }

        if (isPublished !== undefined) {
            query.isPublished = isPublished === 'true' || isPublished === true;
        }

        if (status) query.status = status;
        if (category) query.category = category;
        if (topic) query.topics = { $in: [topic] };
        const sortObj = { updatedAt: -1, createdAt: -1 };

        const [courses, totalCourses] = await Promise.all([
            Course.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort(sortObj)
                .select('thumbnail title status isPublished createdAt updatedAt type'),

            Course.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalCourses / pageSize);

        return reply.send({
            status: 'success',
            message: 'Courses retrieved successfully',
            data: courses,
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
                sort: 'updatedAt desc, createdAt desc',
            }
        });

    } catch (error) {
        return reply.code(500).send({
            status: 'error',
            message: error.message || 'Server error',
        });
    }
};

exports.getCourseById = async (req, reply) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return reply.code(400).send({ error: "Invalid course ID" });
        }

        // 1) Query course (tối ưu các field cần thiết)
        const course = await Course.findById(id)
            .populate("instructors", "fullName")
            .populate("category", "name")
            .populate("topics", "name")
            .populate("relatedCourses", "title")
            .lean(); // BOOST SPEED: không convert sang mongoose document

        if (!course) {
            return reply.code(404).send({ error: "Course not found" });
        }

        // 2) Lấy toàn bộ chapters 1 lần
        const chapters = await Chapter.find({ courseId: id })
            .sort({ order: 1 })
            .lean();

        const chapterIds = chapters.map((c) => c._id);

        // 3) Lấy toàn bộ lessons của tất cả chapters chỉ bằng 1 query
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds } })
            .sort({ order: 1 })
            .select("title order chapterId")
            .lean();

        // 4) Gom lesson vào chapter — KHÔNG dùng Promise.all => nhanh hơn
        const lessonsByChapter = {};
        for (const chapter of chapterIds) {
            lessonsByChapter[chapter] = [];
        }

        for (const lesson of lessons) {
            lessonsByChapter[lesson.chapterId]?.push(lesson);
        }

        // 5) Ghép chapters + lessons
        const chaptersWithLessonCount = chapters.map((chapter) => ({
            _id: chapter._id,
            title: chapter.title,
            order: chapter.order,
            lessonCount: lessonsByChapter[chapter._id].length,
            lessons: lessonsByChapter[chapter._id],
        }));

        // 6) Trả dữ liệu cuối
        return reply.send({
            ...course,
            chapters: chaptersWithLessonCount,
        });
    } catch (error) {
        console.error("GET COURSE BY ID ERROR:", error);
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

        // 1️⃣ Lấy course
        const course = await Course.findOne({ slug })
            .populate("instructors", "fullName email avatar")
            .populate("category", "name slug")
            .populate("topics", "name slug")
            .populate("relatedCourses", "title slug thumbnail originalPrice salePrice")
            .lean();

        if (!course) {
            return reply.code(404).send({
                status: 'error',
                message: "Course not found"
            });
        }

        // 2️⃣ Lấy toàn bộ chapters
        const chapters = await Chapter.find({ courseId: course._id })
            .sort({ order: 1 })
            .lean();

        const chapterIds = chapters.map(ch => ch._id);

        // 3️⃣ Lấy toàn bộ lessons theo chapterIds
        const lessons = await Lesson.find({ chapterId: { $in: chapterIds } })
            .sort({ order: 1 })
            .select("title order duration videoUrl isPreviewAllowed type chapterId")
            .lean();

        // 4️⃣ Lấy durations cho bài video (Items)
        const videoUrls = lessons
            .filter(l => l.type === "video")
            .map(l => l.videoUrl);

        const items = videoUrls.length
            ? await Item.find({ url: { $in: videoUrls } }).select("url duration").lean()
            : [];

        const durationMap = new Map(items.map(i => [i.url, i.duration]));

        // 5️⃣ Gán duration + remove videoUrl nếu không được xem preview
        const lessonsProcessed = lessons.map(lesson => {
            if (lesson.type === "video") {
                lesson.duration = durationMap.get(lesson.videoUrl) || 0;
                if (!lesson.isPreviewAllowed) lesson.videoUrl = null;
            }
            return lesson;
        });

        // 6️⃣ Gộp lessons vào chapters
        const chaptersWithLessons = chapters.map(ch => {
            const ls = lessonsProcessed.filter(l => l.chapterId.toString() === ch._id.toString());
            const totalSeconds = ls.reduce((s, l) => s + (l.duration || 0), 0);

            return {
                ...ch,
                lessonCount: ls.length,
                duration: totalSeconds,
                lessons: ls,
            };
        });

        // 7️⃣ Tổng thời lượng toàn khóa học
        const totalCourseDuration = chaptersWithLessons.reduce(
            (sum, ch) => sum + (ch.duration || 0),
            0
        );

        return reply.send({
            status: 'success',
            message: 'Course retrieved successfully',
            data: {
                ...course,
                duration: totalCourseDuration,
                chapters: chaptersWithLessons
            }
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({
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
        const courseId = req.params.id;
        let payload = req.body;

        if (!courseId) {
            return reply.code(400).send({ error: "Invalid course ID" });
        }

        // ⚡ Only allow fields that can be updated
        const allowedFields = [
            "title",
            "slug",
            "description",
            "shortDescription",
            "thumbnail",
            "price",
            "salePrice",
            "discount",
            "category",
            "topics",
            "instructors",
            "tags",
            "isPublished",
            "status",
            "level",
            "language",
            "accessDuration",
            "badge",
        ];

        const updateData = {};

        // ⚡ Filter only valid fields & non-undefined
        for (const field of allowedFields) {
            if (payload[field] !== undefined) {
                updateData[field] = payload[field];
            }
        }

        // ❗ Prevent updating with empty body
        if (Object.keys(updateData).length === 0) {
            return reply.code(400).send({ error: "No valid fields to update" });
        }

        // ⚡ Update only changed fields
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updateData },
            { new: true }
        ).lean();

        if (!updatedCourse) {
            return reply.code(404).send({ error: "Course not found" });
        }

        return reply.send({
            status: "success",
            message: "Course updated successfully",
            data: updatedCourse
        });

    } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: "Server error" });
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

exports.deleteMultipleCourses = async (req, reply) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ error: 'IDs must be a non-empty array' });
        }
        const result = await Course.deleteMany({ _id: { $in: ids } });
        reply.send({ message: `${result.deletedCount} courses deleted successfully` });
    } catch (error) {
        reply.code(500).send({ error: 'Server error' });
    }
};

exports.duplicateCourse = async (req, reply) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId)
            .populate('category', '_id')
            .populate('instructors', '_id')
            .lean();

        if (!course) return reply.code(404).send({ message: 'Course not found' });

        const newCourse = new Course({
            ...course,
            title: course.title + ' (Copy)',
            slug: course.slug + '-' + Date.now(),
            isPublished: false,
            status: 'draft',
            chapters: [],
        });

        await newCourse.save({ session });

        const oldChapters = await Chapter.find({ courseId }).sort({ order: 1 }).lean();
        const chapterDocs = oldChapters.map(ch => ({
            ...ch,
            _id: mongoose.Types.ObjectId(),
            courseId: newCourse._id
        }));

        const newChapters = await Chapter.insertMany(chapterDocs, { session });

        const oldLessons = await Lesson.find({ chapterId: { $in: oldChapters.map(ch => ch._id) } }).lean();
        const lessonDocs = oldLessons.map(lesson => ({
            ...lesson,
            _id: mongoose.Types.ObjectId(),
            chapterId: newChapters.find(ch => ch.order === oldChapters.find(oc => oc._id.equals(lesson.chapterId)).order)._id
        }));

        await Lesson.insertMany(lessonDocs, { session });

        newCourse.chapters = newChapters.map(ch => ch._id);
        await newCourse.save({ session });

        await session.commitTransaction();
        session.endSession();

        return reply.send({ message: 'Course duplicated successfully', course: newCourse });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err);
        return reply.code(500).send({ message: 'Internal server error' });
    }
};

// exports.duplicateCourse = async (req, reply) => {
//     try {
//         const courseId = req.params.id;

//         const course = await Course.findById(courseId)
//             .populate({ path: 'category', select: '_id' })
//             .populate({ path: 'instructors', select: '_id' });

//         if (!course) {
//             return reply.code(404).send({ message: 'Course not found' });
//         }

//         const newCourse = new Course({
//             title: course.title + ' (Copy)',
//             slug: course.slug + '-' + Date.now(), // Tạo slug mới tránh trùng
//             description: course.description,
//             thumbnail: course.thumbnail,
//             price: course.price,
//             discount: course.discount,
//             category: course.category?._id || null,
//             level: course.level,
//             language: course.language,
//             instructors: course.instructors.map(i => i._id),
//             tags: course.tags,
//             isPublished: false,
//             status: 'draft',
//             accessDuration: course.accessDuration,
//             badge: course.badge,
//             chapters: [], // sẽ cập nhật sau
//         });

//         await newCourse.save();

//         // ✅ Clone Chapter & Lesson
//         const oldChapters = await Chapter.find({ courseId }).sort({ order: 1 });
//         const chapterMap = new Map();

//         for (const oldChapter of oldChapters) {
//             const newChapter = new Chapter({
//                 courseId: newCourse._id,
//                 title: oldChapter.title,
//                 description: oldChapter.description,
//                 order: oldChapter.order,
//             });
//             await newChapter.save();
//             chapterMap.set(oldChapter._id.toString(), newChapter._id);

//             // Clone bài học (lessons) trong chapter đó
//             const oldLessons = await Lesson.find({ chapterId: oldChapter._id });
//             for (const oldLesson of oldLessons) {
//                 const newLesson = new Lesson({
//                     chapterId: newChapter._id,
//                     title: oldLesson.title,
//                     content: oldLesson.content,
//                     videoUrl: oldLesson.videoUrl,
//                     duration: oldLesson.duration,
//                     type: oldLesson.type,
//                     order: oldLesson.order,
//                     isPreviewAllowed: oldLesson.isPreviewAllowed,
//                 });
//                 await newLesson.save();
//             }

//             newCourse.chapters.push(newChapter._id);
//         }

//         await newCourse.save();

//         return reply.send({ message: 'Course duplicated successfully', course: newCourse });

//     } catch (error) {
//         console.error(error);
//         return reply.code(500).send({ message: 'Internal server error' });
//     }
// };

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
