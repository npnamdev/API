const RoleController = require('../controllers/role.controller');

async function roleRoutes(fastify) {
    fastify.get('/roles', RoleController.getRoles);
    fastify.post('/roles', RoleController.createRole);
    fastify.post('/roles/:roleId/permissions', RoleController.addPermissionsToRole);
    fastify.delete('/roles/:roleId/permissions', RoleController.removePermissionsFromRole);
    fastify.get('/roles/:roleId/permissions', RoleController.getRolePermissions);
}

module.exports = roleRoutes;