const userController = require('../controllers/user.controller');

async function userRoutes(fastify) {
    fastify.post('/users', userController.createUser);
    fastify.get('/users', userController.getAllUsers);
    fastify.get('/users/:id', userController.getUserById);
    fastify.put('/users/:id', userController.updateUserById);
    fastify.delete('/users/:id', userController.deleteUserById);
    fastify.get('/users/me', { preHandler: [fastify.authenticate] }, userController.getMe);
}

module.exports = userRoutes;
