const User = require('../models/user.model');


exports.createUser = async (request, reply) => {
    try {
        const body = { ...request.body };

        if (!body.username || !body.email || !body.password) {
            return reply.code(400).send({ status: 'error', message: 'Missing required fields' });
        }

        const user = new User(body);
        await user.save();

        const userObj = user.toObject();
        const { password: _, __v, ...userWithoutPassword } = userObj;

        reply.code(201).send({
            status: 'success',
            message: 'User created successfully',
            data: userWithoutPassword,
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.getAllUsers = async (request, reply) => {
    try {
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const limit = Math.min(parseInt(request.query.limit) || 10, 100);
        const sortBy = request.query.sortBy || 'createdAt';
        const sortOrder = request.query.sort === 'asc' ? 1 : -1;
        const search = request.query.search || '';
        const searchFields = request.query.searchFields || '';
        const timeRange = request.query.timeRange || '';
        const dateParam = request.query.date || '';
        const startDateParam = request.query.startDate || '';
        const endDateParam = request.query.endDate || '';

        const skip = (page - 1) * limit;

        const excludeFields = [
            'page',
            'limit',
            'sort',
            'sortBy',
            'search',
            'searchFields',
            'timeRange',
            'date',
            'startDate',
            'endDate',
        ];

        const filterConditions = [];

        // Lọc theo các trường còn lại
        for (const key in request.query) {
            if (!excludeFields.includes(key)) {
                filterConditions.push({ [key]: request.query[key] });
            }
        }

        // Lọc theo searchFields
        if (search && searchFields) {
            const fields = searchFields.split(',');
            const searchConditions = fields.map((field) => ({
                [field]: { $regex: search, $options: 'i' },
            }));
            filterConditions.push({ $or: searchConditions });
        }

        // --- Ưu tiên lọc theo khoảng ngày startDate - endDate ---
        if (startDateParam && endDateParam) {
            const startDate = new Date(startDateParam);
            const endDate = new Date(endDateParam);
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                // Đặt thời gian bắt đầu và kết thúc trong ngày
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                filterConditions.push({
                    createdAt: { $gte: startDate, $lte: endDate },
                });
            }
        }
        // Nếu không có khoảng, xét đến 1 ngày cụ thể
        else if (dateParam) {
            const date = new Date(dateParam);
            if (!isNaN(date.getTime())) {
                const startOfDay = new Date(date.setHours(0, 0, 0, 0));
                const endOfDay = new Date(date.setHours(23, 59, 59, 999));
                filterConditions.push({
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                });
            }
        }
        // Nếu không có cả date và start/end, xét timeRange
        else if (timeRange) {
            const match = timeRange.match(/^(\d+)([dwm y])$/);
            if (match) {
                const value = parseInt(match[1]);
                const unit = match[2];
                const now = new Date();
                let fromDate = new Date(now);

                switch (unit) {
                    case 'd':
                        fromDate.setDate(now.getDate() - value);
                        break;
                    case 'w':
                        fromDate.setDate(now.getDate() - value * 7);
                        break;
                    case 'm':
                        fromDate.setMonth(now.getMonth() - value);
                        break;
                    case 'y':
                        fromDate.setFullYear(now.getFullYear() - value);
                        break;
                }

                filterConditions.push({ createdAt: { $gte: fromDate } });
            }
        }

        const finalFilter =
            filterConditions.length > 0 ? { $and: filterConditions } : {};

        const totalUsers = await User.countDocuments(finalFilter);
        const users = await User.find(finalFilter)
            .select('fullName email avatarUrl role isActive createdAt updatedAt')
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({ path: 'role', select: 'label -_id' });

        return reply.send({
            success: true,
            data: users,
            pagination: {
                total: totalUsers,
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
            },
        });
    } catch (error) {
        console.error(error);
        return reply.status(500).send({
            success: false,
            message: 'Server Error',
        });
    }
};

exports.getUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id).select('-password').populate({ path: 'role', select: 'label' });

        if (!user) {
            return reply.code(404).send({ status: 'error', message: 'User not found' });
        }

        const userObject = user.toObject();
        reply.send({
            status: 'success',
            message: 'User retrieved successfully',
            data: userObject,
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.updateUserById = async (request, reply) => {
    try {
        const updateData = request.body;
        const user = await User.findById(request.params.id);

        if (!user) {
            return reply.code(404).send({ status: 'error', message: 'User not found' });
        }

        if (user.email === process.env.ADMIN_EMAIL) {
            return reply.code(403).send({
                status: 'error',
                message: `The user with email "${process.env.ADMIN_EMAIL}" cannot be modified.`,
            });
        }

        const updatedUser = await User.findByIdAndUpdate(request.params.id, updateData, { new: true });

        const userObject = updatedUser.toObject();
        const { password: _, ...userWithoutPassword } = userObject;

        reply.send({ status: 'success', message: 'User updated successfully', data: userWithoutPassword });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.deleteUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id);
        if (!user) {
            return reply.code(404).send({ status: 'error', message: 'User not found' });
        }

        if (user.email === process.env.ADMIN_EMAIL) {
            return reply.code(403).send({
                status: 'error',
                message: `The user with email "${process.env.ADMIN_EMAIL}" cannot be deleted.`,
            });
        }

        await User.findByIdAndDelete(request.params.id);
        reply.send({ status: 'success', message: 'User deleted successfully' });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.deleteMultipleUsers = async (request, reply) => {
    try {
        const { ids } = request.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ status: 'error', message: 'Invalid or empty ids array' });
        }

        // Find users to check for admin
        const users = await User.find({ _id: { $in: ids } });

        if (users.length === 0) {
            return reply.code(404).send({ status: 'error', message: 'No users found with provided ids' });
        }

        // Filter out admin user
        const deletableUsers = users.filter(user => user.email !== process.env.ADMIN_EMAIL);
        const adminUsers = users.filter(user => user.email === process.env.ADMIN_EMAIL);

        if (deletableUsers.length === 0) {
            return reply.code(403).send({
                status: 'error',
                message: `All provided users include the admin user "${process.env.ADMIN_EMAIL}" which cannot be deleted.`,
            });
        }

        // Delete the allowed users
        const deletableIds = deletableUsers.map(user => user._id);
        const deleteResult = await User.deleteMany({ _id: { $in: deletableIds } });

        const message = adminUsers.length > 0
            ? `Deleted ${deleteResult.deletedCount} users. Skipped ${adminUsers.length} admin user(s).`
            : `Deleted ${deleteResult.deletedCount} users successfully.`;

        reply.send({
            status: 'success',
            message,
            data: {
                deletedCount: deleteResult.deletedCount,
                skippedAdmins: adminUsers.length,
            },
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.getMe = async (request, reply) => {
    try {
        const user = await User.findById(request.user.id).select('-password').populate({ path: 'role', select: 'name' }).lean();
        return reply.send(user);
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};
