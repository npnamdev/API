const User = require('../models/user.model');
const Course = require('../models/course.model');
const Order = require('../models/order.model');

const getStatistics = async (req, reply) => {
    try {
        const [totalUsers, totalCourses, totalOrders, totalRevenueData] = await Promise.all([
            User.estimatedDocumentCount(),
            Course.estimatedDocumentCount(),
            Order.estimatedDocumentCount(),
            Order.aggregate([
                { $group: { _id: null, total: { $sum: "$totalPrice" } } }
            ])
        ]);

        reply.send({
            totalUsers,
            totalCourses,
            totalOrders,
            totalRevenue: totalRevenueData[0]?.total || 0
        });

    } catch (err) {
        reply.status(500).send({ error: "Server error" });
    }
};

module.exports = { getStatistics };