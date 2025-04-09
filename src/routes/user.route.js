const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');
const authorize = require('../middlewares/authorize.middleware');

async function userRoutes(fastify) {
    fastify.post('/users', userController.createUser);
    fastify.get('/users', userController.getAllUsers);
    fastify.get('/users/:id', { preHandler: authenticate }, userController.getUserById);
    fastify.put('/users/:id', userController.updateUserById);
    fastify.delete('/users/:id', { preHandler: [authenticate, authorize('DELETE_USER')] }, userController.deleteUserById);
    fastify.get('/users/me', userController.getMe);
}

module.exports = userRoutes;
