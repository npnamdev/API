const Permission = require('../models/permission.model');

exports.createPermission = async (request, reply) => {
    try {
        const existing = await Permission.findOne({ name: request.body.name });
        if (existing) {
            return reply.status(400).send({ status: 'error', message: 'Permission with this name already exists' });
        }
        const permission = new Permission(request.body);
        await permission.save();
        reply.send({ status: 'success', message: 'Permission created successfully', data: permission });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

exports.getPermissions = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'desc' } = request.query;
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;
        const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};
        const sortOrder = sort === 'asc' ? 1 : -1;

        const permissions = await Permission.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder });

        const totalPermissions = await Permission.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalPermissions / pageSize);

        reply.send({
            status: 'success',
            message: 'Permissions retrieved successfully',
            data: permissions,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalPermissions,
                limit: pageSize,
            },
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

exports.getPermissionById = async (request, reply) => {
    const { id } = request.params;
    try {
        const permission = await Permission.findById(id).lean();
        if (!permission) {
            return reply.status(404).send({ status: 'error', message: 'Permission not found' });
        }
        reply.send({ status: 'success', message: 'Permission retrieved successfully', data: permission });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

exports.updatePermission = async (request, reply) => {
    const { id } = request.params;
    try {
        const updated = await Permission.findByIdAndUpdate(id, request.body, { new: true });
        if (!updated) {
            return reply.status(404).send({ status: 'error', message: 'Permission not found' });
        }
        reply.send({ status: 'success', message: 'Permission updated successfully', data: updated });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};

exports.deletePermission = async (request, reply) => {
    const { id } = request.params;
    try {
        const deleted = await Permission.findByIdAndDelete(id);
        if (!deleted) {
            return reply.status(404).send({ status: 'error', message: 'Permission not found' });
        }
        reply.send({ status: 'success', message: 'Permission deleted successfully' });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
};