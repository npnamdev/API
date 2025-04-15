const authController = require('../controllers/auth.controller');

async function authRoutes(fastify, options) {
    // fastify.post('/auth/login', authController.login);
    fastify.post('/auth/login', {
        config: {
            rateLimit: {
                max: 5, // Tối đa 5 lần
                timeWindow: '1 minute' // Trong vòng 1 phút
            }
        }
    }, authController.login);
    // fastify.post('/auth/register', authController.register);
    // fastify.get('/auth/verify-email', authController.verifyEmail);
    // fastify.post('/auth/logout', authController.logout);
    // fastify.post('/auth/refresh-token', authController.refreshToken);
    // fastify.post('/auth/forgot-password', authController.forgotPassword);
    // fastify.post('/auth/reset-password', authController.resetPassword);
    // fastify.post('/auth/change-password', { preHandler: [fastify.authenticate] }, authController.changePassword);
}

module.exports = authRoutes;