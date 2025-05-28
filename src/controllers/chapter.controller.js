const Chapter = require('../models/chapter.model');

// Lấy danh sách tất cả chương học theo thứ tự kéo thả
exports.getAllChapters = async (req, reply) => {
    try {
        const chapters = await Chapter.find()
            .populate('lessons')
            .sort({ order: 1 });
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