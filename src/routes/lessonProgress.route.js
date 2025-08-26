const { upsertLessonProgress, getLastLessonProgress } = require('../controllers/lessonProgress.controller');

async function lessonProgressRoutes(fastify, opts) {
  fastify.post('/lesson-progress', upsertLessonProgress);
  fastify.get('/lesson-progress/last/:userId', getLastLessonProgress);
}

module.exports = lessonProgressRoutes;