const User = require('../models/user.model');
const Course = require('../models/course.model');
const Order = require('../models/order.model');

const getStatistics = async (req, reply) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalOrders = await Order.countDocuments();

        const totalRevenueData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);
        const totalRevenue = totalRevenueData[0]?.total || 0;

        reply.send({
            totalUsers,
            totalCourses,
            totalOrders,
            totalRevenue
        });
    } catch (err) {
        console.error(err);
        reply.status(500).send({ error: 'Server error' });
    }
};

module.exports = {
    getStatistics,
};
