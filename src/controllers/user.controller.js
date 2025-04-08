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
        const { page = 1, limit = 10, search = '', sort = 'desc' } = request.query;
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        const searchQuery = search
            ? {
                $or: [
                    { email: { $regex: `^${search}`, $options: 'i' } },
                    { username: { $regex: `^${search}`, $options: 'i' } },
                ],
            }
            : {};

        const sortOrder = sort === 'asc' ? 1 : -1;

        const users = await User.find(searchQuery)
            .select('-password')
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder })
            .populate({ path: 'role', select: 'name' });

        const totalUsers = await User.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / pageSize);

        reply.send({
            status: 'success',
            message: 'Users retrieved successfully',
            data: users,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalUsers,
                limit: pageSize,
            },
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
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
    try {
        const userId = request.user?._id;

        if (!userId) {
            return reply.code(401).send({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const user = await User.findById(userId)
            .select('-password')
            .populate({ path: 'role', select: 'name' });

        if (!user) {
            return reply.code(404).send({
                status: 'error',
                message: 'User not found',
            });
        }

        reply.send({
            status: 'success',
            message: 'User retrieved successfully',
            data: user.toObject(),
        });
    } catch (error) {
        reply.internalServerError(error.message || 'Internal Server Error');
    }
};

