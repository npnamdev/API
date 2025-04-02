const AuthController = require('../controllers/auth.controller');

async function authRoutes(fastify) {
    fastify.post('/auth/register', AuthController.register);
    fastify.post('/auth/login', AuthController.login);
    fastify.get('/auth/profile', { preHandler: [fastify.authenticate] }, AuthController.getProfile);
}

module.exports = authRoutes;