const Order = require('../models/order.model');
const Course = require('../models/course.model');

exports.createOrder = async (req, reply) => {
    try {
        const { courses } = req.body;

        if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return reply.code(400).send({ error: 'Courses is required and must be a non-empty array' });
        }

        const courseDocs = await Course.find({ _id: { $in: courses } });
        if (!courseDocs.length) return reply.code(400).send({ error: 'Courses not found' });

        const totalPrice = courseDocs.reduce((sum, course) => sum + (course.price || 0), 0);

        const order = new Order({
            ...req.body,
            totalPrice,
        });

        await order.save();

        reply.code(201).send(order);
    } catch (error) {
        reply.code(500).send({ error: error.message });
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
