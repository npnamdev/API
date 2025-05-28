const chapterController = require('../controllers/chapter.controller');

async function chapterRoutes(fastify, opts) {
    fastify.get('/chapters', chapterController.getAllChapters);
    fastify.get('/chapters/:id', chapterController.getChapterById);
    fastify.post('/chapters', chapterController.createChapter);
    fastify.put('/chapters/:id', chapterController.updateChapter);
    fastify.delete('/chapters/:id', chapterController.deleteChapter);
    fastify.put('/chapters/reorder', chapterController.updateChapterOrder);
}

module.exports = chapterRoutes;
