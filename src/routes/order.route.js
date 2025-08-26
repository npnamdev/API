const orderController = require('../controllers/order.controller');

async function orderRoutes(fastify, options) {
    fastify.post('/orders', orderController.createOrder);
    fastify.get('/orders', orderController.getAllOrders);
    fastify.get('/orders/:id', orderController.getOrderById);
    fastify.put('/orders/:id', orderController.updateOrder);
    fastify.delete('/orders/:id', orderController.deleteOrder);

    // ✅ Route cập nhật trạng thái đơn hàng
    fastify.put('/orders/:orderId/status', orderController.updateOrderStatus);
}

module.exports = orderRoutes;