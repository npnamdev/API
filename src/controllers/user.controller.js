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
        const skip = (page - 1) * limit;
        const excludeFields = ['page', 'limit', 'sort', 'sortBy', 'search', 'searchFields'];
        const filterConditions = [];
        for (const key in request.query) {
            if (!excludeFields.includes(key)) {
                filterConditions.push({ [key]: request.query[key] });
            }
        }
        if (search && searchFields) {
            const fields = searchFields.split(',');
            const searchConditions = fields.map(field => ({
                [field]: { $regex: search, $options: 'i' },
            }));
            filterConditions.push({ $or: searchConditions });
        }
        const finalFilter = filterConditions.length > 0 ? { $and: filterConditions } : {};
        const totalUsers = await User.countDocuments(finalFilter);
        const users = await User.find(finalFilter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortOrder })
            .populate({ path: 'role', select: 'name' });

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
        return reply.status(500).send({ success: false, message: 'Server Error' });
    }
};


exports.getUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id).select('-password').populate({ path: 'role', select: 'name' });

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

        // Nếu email là root@doman.com thì chặn lại
        if (updateData.email === "root@doman.com") {
            return reply.code(403).send({
                status: 'error',
                message: 'Email address "root@doman.com" is not allowed.',
            });
        }

        const user = await User.findByIdAndUpdate(
            request.params.id,
            updateData,
            { new: true }
        );

        if (!user) {
            return reply.code(404).send({
                status: 'error',
                message: 'User not found',
            });
        }

        const userObject = user.toObject();
        const { password: _, ...userWithoutPassword } = userObject;

        reply.send({
            status: 'success',
            message: 'User updated successfully',
            data: userWithoutPassword,
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.deleteUserById = async (request, reply) => {
    try {
        const user = await User.findById(request.params.id);
        if (!user) {
            return reply.code(404).send({
                status: 'error',
                message: 'User not found',
            });
        }

        if (user.email === "root@doman.com") {
            return reply.code(403).send({
                status: 'error',
                message: 'The user with email "root@doman.com" cannot be deleted.',
            });
        }

        await User.findByIdAndDelete(request.params.id);

        reply.send({
            status: 'success',
            message: 'User deleted successfully',
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

exports.getMe = async (request, reply) => {
    console.log("request", request.user)
    try {
        const user = await User.findById(request.user.id).select('-password').populate({ path: 'role', select: 'name' });
        return reply.send(user);
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};
