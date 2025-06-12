const mongoose = require('mongoose');

const StatisticSchema = new mongoose.Schema(
    {
        totalUsers: { type: Number, default: 0 },
        totalCourses: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Statistic', StatisticSchema);
