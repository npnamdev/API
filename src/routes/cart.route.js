const controller = require('../controllers/cart.controller');

async function cartRoutes(fastify, options) {
    fastify.get('/carts', { preHandler: [fastify.authenticate] }, controller.getCart);
    fastify.post('/carts', { preHandler: [fastify.authenticate] }, controller.addToCart);
    fastify.delete('/carts/:courseId', { preHandler: [fastify.authenticate] }, controller.removeFromCart);
    fastify.delete('/carts', { preHandler: [fastify.authenticate] }, controller.clearCart);
    fastify.post('/carts/checkout', { preHandler: [fastify.authenticate] }, controller.checkout);
}

module.exports = cartRoutes;