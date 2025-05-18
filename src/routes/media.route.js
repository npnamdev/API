const mediaController = require('../controllers/media.controller');

async function mediaRoutes(fastify) {
    fastify.post('/media', mediaController.createMedia);
    fastify.post('/media/imagekit', mediaController.uploadToImageKit);
    fastify.post('/media/uploadcare', mediaController.uploadToUploadcare);

    fastify.get('/media', mediaController.getAllMedia);
    fastify.get('/media/:id', mediaController.getMediaById);

    fastify.delete('/media/:id', mediaController.deleteMediaById); // Xoá 1
    fastify.delete('/media', mediaController.deleteManyMedia);     // Xoá nhiều
}

module.exports = mediaRoutes;