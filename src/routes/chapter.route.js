const chapterController = require('../controllers/chapter.controller');

async function chapterRoutes(fastify, opts) {
    fastify.get('/chapters', chapterController.getAllChapters);
    fastify.get('/chapters/:id', chapterController.getChapterById);
    fastify.post('/chapters', chapterController.createChapter);
    fastify.put('/chapters/reorder', chapterController.updateChapterOrder);
    fastify.put('/chapters/:id', chapterController.updateChapter);
    fastify.delete('/chapters/:id', chapterController.deleteChapter);
    fastify.post('/chapters/:chapterId/lessons', chapterController.createLessonForChapter);

    fastify.get('/courses/:courseId/chapters', chapterController.getChaptersWithLessons);
}

module.exports = chapterRoutes;
