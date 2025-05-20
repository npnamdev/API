const permissionController = require('../controllers/permission.controller');

async function permissionRoutes(fastify) {
    fastify.get('/permissions', permissionController.getPermissions);
    fastify.get('/permissions/:id', permissionController.getPermissionById);
    fastify.post('/permissions', permissionController.createPermission);
    fastify.put('/permissions/:id', permissionController.updatePermission);
    fastify.delete('/permissions/:id', permissionController.deletePermission);
    fastify.post('/permissions/bulk', permissionController.createPermissionsBulk);
}

module.exports = permissionRoutes;