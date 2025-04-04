const mediaController = require('../controllers/media.controller');

async function mediaRoutes(fastify) {
    fastify.post('/media', mediaController.createMedia); // Create a new media
    fastify.get('/media', mediaController.getAllMedia); // Get all media
    fastify.get('/media/:id', mediaController.getMediaById); // Get a media by ID
    fastify.put('/media/:id', mediaController.updateMediaById); // Update a media by ID
    fastify.delete('/media/:id', mediaController.deleteMediaById); // Delete a media by ID
}

module.exports = mediaRoutes;

