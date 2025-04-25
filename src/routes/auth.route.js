const authController = require('../controllers/auth.controller');

async function authRoutes(fastify, options) {
    fastify.post('/auth/login', authController.login);
    fastify.post('/auth/logout', authController.logout);
    fastify.get('/auth/verify-email', authController.verifyEmail);
    fastify.get('/auth/protected', { preHandler: [fastify.authenticate] }, authController.protectedRoute);
    // fastify.post('/auth/register', authController.register);
    // fastify.post('/auth/refresh-token', authController.refreshToken);
    // fastify.post('/auth/forgot-password', authController.forgotPassword);
    // fastify.post('/auth/reset-password', authController.resetPassword);
    // fastify.post('/auth/change-password', { preHandler: [fastify.authenticate] }, authController.changePassword);
}

module.exports = authRoutes;