const folderController = require('../controllers/folder.controller');

async function folderRoutes(fastify, options) {
    fastify.get('/folders', folderController.getFolders);
    fastify.post('/folders', folderController.createFolder);
    fastify.delete('/folders/:id', folderController.deleteFolder);
}

module.exports = folderRoutes;
