const roleController = require('../controllers/role.controller');
const { checkPermission } = require('../middlewares/authorization');

async function roleRoutes(fastify) {
    fastify.post('/roles', { preHandler: [fastify.authenticate, checkPermission('CREATE_ROLE')] }, roleController.createRole);
    fastify.get('/roles', roleController.getAllRoles);
    fastify.get('/roles/:id', roleController.getRoleById);
    fastify.get('/roles/:id/permissions', { preHandler: [fastify.authenticate, checkPermission('READ_ROLE')] }, roleController.getPermissionsOfRole);
    fastify.put('/roles/:id', { preHandler: [fastify.authenticate, checkPermission('UPDATE_ROLE')] }, roleController.updateRoleById);
    fastify.delete('/roles/:id', { preHandler: [fastify.authenticate, checkPermission('DELETE_ROLE')] }, roleController.deleteRoleById);
    fastify.delete('/roles', { preHandler: [fastify.authenticate, checkPermission('DELETE_ROLE')] }, roleController.deleteMultipleRoles);
    fastify.put('/roles/:roleId/permissions', { preHandler: [fastify.authenticate, checkPermission('ASSIGN_PERMISSIONS_TO_ROLE')] }, roleController.assignPermissionsToRole);
}

module.exports = roleRoutes;
