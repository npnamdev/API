const userController = require('../controllers/user.controller');

async function userRoutes(fastify) {
    fastify.post('/users', userController.createUser);
    fastify.get('/users', userController.getAllUsers);
    fastify.get('/users/:id', userController.getUserById);
    fastify.put('/users/:id', userController.updateUserById);
    fastify.delete('/users/:id', userController.deleteUserById);
    fastify.get('/users/me', userController.getMe);
}

module.exports = userRoutes;



// const userController = require('../controllers/user.controller');
// const authenticate = require('../middlewares/authenticate.middleware');
// const authorize = require('../middlewares/authorize.middleware');

// async function userRoutes(fastify) {
//   fastify.get('/users/me', { preHandler: authenticate }, userController.getMe);
//   fastify.get('/users', { preHandler: [authenticate, authorize('admin')] }, userController.getAllUsers);
//   fastify.get('/users/:id', { preHandler: authenticate }, userController.getUserById);
//   fastify.post('/users', { preHandler: [authenticate, authorize('admin')] }, userController.createUser);
//   fastify.put('/users/:id', { preHandler: authenticate }, userController.updateUserById);
//   fastify.delete('/users/:id', { preHandler: authenticate }, userController.deleteUserById);
// }

// module.exports = userRoutes;
