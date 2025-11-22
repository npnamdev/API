const userController = require('../controllers/user.controller');
const { checkPermission } = require('../middlewares/authorization');

async function userRoutes(fastify) {
    fastify.post('/users', { preHandler: [fastify.authenticate, checkPermission('CREATE_USER')] }, userController.createUser);
    fastify.get('/users', { preHandler: [fastify.authenticate, checkPermission('READ_USER')] }, userController.getAllUsers);
    fastify.get('/users/:id', { preHandler: [fastify.authenticate, checkPermission('READ_USER')] }, userController.getUserById);
    fastify.put('/users/:id', { preHandler: [fastify.authenticate, checkPermission('UPDATE_USER')] }, userController.updateUserById);
    fastify.delete('/users/:id', { preHandler: [fastify.authenticate, checkPermission('DELETE_USER')] }, userController.deleteUserById);
    fastify.delete('/users', { preHandler: [fastify.authenticate, checkPermission('DELETE_USER')] }, userController.deleteMultipleUsers);
    fastify.get('/users/me', { preHandler: [fastify.authenticate] }, userController.getMe);
}

module.exports = userRoutes;
