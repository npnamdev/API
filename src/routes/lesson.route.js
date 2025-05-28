const lessonController = require('../controllers/lesson.controller');

async function lessonRoutes(fastify, options) {
    fastify.get('/lessons', lessonController.getAllLessons);
    fastify.get('/lessons/:id', lessonController.getLessonById);
    fastify.post('/lessons', lessonController.createLesson);
    fastify.put('/lessons/reorder', chapterController.updateLessonOrder);
    fastify.put('/lessons/:id', lessonController.updateLesson);
    fastify.delete('/lessons/:id', lessonController.deleteLesson);
}

module.exports = lessonRoutes;
