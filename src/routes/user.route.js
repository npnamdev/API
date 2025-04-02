const UserController = require('../controllers/user.controller');

async function userRoutes(fastify) {
    fastify.get('/users', UserController.getUsers);
    fastify.post('/users', UserController.createUser);
}

module.exports = userRoutes;