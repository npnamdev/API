const PermissionController = require('../controllers/permission.controller');

async function permissionRoutes(fastify) {
    fastify.get('/permissions', PermissionController.getPermissions);
    fastify.post('/permissions', PermissionController.createPermission);
    fastify.delete('/permissions/:permissionId', PermissionController.deletePermission);  
}

module.exports = permissionRoutes;