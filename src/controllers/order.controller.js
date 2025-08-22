const Order = require('../models/order.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

exports.createOrder = async (req, res) => {
    try {
        const { userId, courseIds, paymentMethod } = req.body;

        // 1. Kiểm tra userId
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Kiểm tra courseIds
        if (!Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ message: 'courseIds must be a non-empty array' });
        }

        // 3. Kiểm tra các khóa học có tồn tại không
        const courses = await Course.find({ _id: { $in: courseIds } });
        if (courses.length !== courseIds.length) {
            return res.status(404).json({ message: 'Some courses not found' });
        }

        // 4. Tính tổng giá khóa học
        const totalPrice = courses.reduce((sum, course) => sum + (course.price || 0), 0);

        // 5. Tạo đơn hàng
        const newOrder = await Order.create({
            user: userId,
            courses: courseIds,
            paymentMethod,
            totalPrice,
            status: 'pending',
            isPaid: false
        });

        return res.status(201).json({
            message: 'Order created successfully',
            order: newOrder
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getAllOrders = async (req, reply) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;
        const skip = (page - 1) * limit;
        const filter = search ? { orderCode: { $regex: search, $options: 'i' } } : {};
        const sortOrder = sort === 'asc' ? 1 : -1;

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('courses', 'title')  // populate courses, lấy trường title
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: sortOrder });

        const total = await Order.countDocuments(filter);

        reply.send({
            status: 'success',
            data: orders,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.getOrderById = async (req, reply) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('courses', 'title');
        if (!order) return reply.code(404).send({ error: 'Order not found' });
        reply.send(order);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.updateOrder = async (req, reply) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!order) return reply.code(404).send({ error: 'Order not found' });
        reply.send(order);
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};

exports.deleteOrder = async (req, reply) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return reply.code(404).send({ error: 'Order not found' });
        reply.send({ message: 'Order deleted successfully' });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};
