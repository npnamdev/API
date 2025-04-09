const roleController = require('../controllers/role.controller');

async function roleRoutes(fastify) {
    fastify.post('/roles', roleController.createRole);
    fastify.get('/roles', roleController.getAllRoles);
    fastify.get('/roles/:id', roleController.getRoleById);
    fastify.get('/roles/:id/permissions', roleController.getPermissionsOfRole);
    fastify.put('/roles/:id', roleController.updateRoleById);
    fastify.delete('/roles/:id', roleController.deleteRoleById);
    
    fastify.put('/roles/:roleId/permissions', roleController.assignPermissionsToRole);

}

module.exports = roleRoutes;