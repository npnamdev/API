const Cart = require('../models/cart.model');
const Course = require('../models/course.model');
const Order = require('../models/order.model');

// Lấy giỏ hàng của user
exports.getCart = async (req, reply) => {
    try {
        const userId = req.user.id; // Giả sử có auth middleware set req.user

        let cart = await Cart.findOne({ user: userId }).populate('items.course', 'title thumbnail originalPrice salePrice');
        if (!cart) {
            cart = new Cart({ user: userId, items: [], total: 0 });
            await cart.save();
        }

        reply.send({
            status: 'success',
            data: cart
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

// Thêm khóa học vào giỏ hàng
exports.addToCart = async (req, reply) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.body;

        if (!courseId) {
            return reply.code(400).send({ status: 'error', message: 'courseId is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return reply.code(404).send({ status: 'error', message: 'Course not found' });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [], total: 0 });
        }

        // Kiểm tra đã có trong giỏ chưa
        const existingItem = cart.items.find(item => item.course.toString() === courseId);
        if (existingItem) {
            return reply.code(400).send({ status: 'error', message: 'Course already in cart' });
        }

        // Thêm item
        const price = course.salePrice || course.originalPrice;
        cart.items.push({
            course: courseId,
            price: price
        });

        // Tính tổng
        cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

        await cart.save();
        await cart.populate('items.course', 'title thumbnail originalPrice salePrice');

        reply.send({
            status: 'success',
            message: 'Course added to cart',
            data: cart
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

// Xóa khóa học khỏi giỏ hàng
exports.removeFromCart = async (req, reply) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return reply.code(404).send({ status: 'error', message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.course.toString() !== courseId);
        cart.total = cart.items.reduce((sum, item) => sum + item.price, 0);

        await cart.save();
        await cart.populate('items.course', 'title thumbnail originalPrice salePrice');

        reply.send({
            status: 'success',
            message: 'Course removed from cart',
            data: cart
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, reply) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { items: [], total: 0 },
            { new: true }
        );

        reply.send({
            status: 'success',
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

// Checkout: tạo order từ giỏ hàng
exports.checkout = async (req, reply) => {
    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId }).populate('items.course');
        if (!cart || cart.items.length === 0) {
            return reply.code(400).send({ status: 'error', message: 'Cart is empty' });
        }

        // Tạo order
        const orderItems = cart.items.map(item => ({
            course: item.course._id,
            price: item.price
        }));

        const totalAmount = cart.total;

        const newOrder = new Order({
            user: userId,
            items: orderItems,
            totalAmount: totalAmount,
            status: 'pending' // Hoặc 'paid' nếu tích hợp thanh toán
        });

        await newOrder.save();

        // Xóa giỏ hàng sau checkout
        cart.items = [];
        cart.total = 0;
        await cart.save();

        reply.send({
            status: 'success',
            message: 'Order created successfully',
            data: { order: newOrder }
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};