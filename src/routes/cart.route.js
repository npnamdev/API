const controller = require('../controllers/cart.controller');

async function cartRoutes(fastify, options) {
    // Giả sử có auth middleware
    fastify.addHook('preHandler', async (request, reply) => {
        // Kiểm tra auth, set request.user
        // Nếu chưa có, bỏ qua hoặc thêm logic
    });

    fastify.get('/carts', controller.getCart);
    fastify.post('/carts', controller.addToCart);
    fastify.delete('/carts/:courseId', controller.removeFromCart);
    fastify.delete('/carts', controller.clearCart);
    fastify.post('/carts/checkout', controller.checkout);
}

module.exports = cartRoutes;