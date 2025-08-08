const fileController = require('../controllers/file.controller');

async function fileRoutes(fastify, options) {
    fastify.get('/files/:folderId', fileController.getFilesByFolder);
    fastify.post('/files', fileController.uploadFile);
    fastify.delete('/files/:id', fileController.deleteFile);
}

module.exports = fileRoutes;
