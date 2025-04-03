const mediaController = require('../controllers/media.controller');
const multer = require('fastify-multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function mediaRoutes(fastify) {
    fastify.post('/media', { preHandler: upload.single('image') }, mediaController.createMedia);
    fastify.get('/media', mediaController.getAllMedia);
    fastify.get('/media/:id', mediaController.getMediaById);
    fastify.put('/media/:id', mediaController.updateMedia);
    fastify.delete('/media/:id', mediaController.deleteMedia);
}

module.exports = mediaRoutes;
