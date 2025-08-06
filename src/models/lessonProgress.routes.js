const lessonProgressController = require('../controllers/lessonProgress.controller');

async function lessonProgressRoutes(fastify, options) {
    fastify.post('/lesson-progress', lessonProgressController.markLessonAsCompleted);
    fastify.get('/lesson-progress/:userId', lessonProgressController.getCompletedLessonsByUser);
}

module.exports = lessonProgressRoutes;
