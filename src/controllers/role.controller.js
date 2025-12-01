const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const User = require('../models/user.model');

exports.createRole = async (request, reply) => {
    try {
        const existingRole = await Role.findOne({ name: request.body.name });
        if (existingRole) {
            return reply.code(400).send({
                status: 'error',
                message: 'Role with this name already exists',
            });
        }

        const role = new Role(request.body);
        await role.save();

        reply.send({
            status: 'success',
            message: 'Role created successfully',
            data: role,
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.getAllRoles = async (request, reply) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'desc' } = request.query;
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;
        const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};
        const sortOrder = sort === 'asc' ? 1 : -1;

        const [rolesResult, totalRoles] = await Promise.all([
            Role.aggregate([
                { $match: searchQuery },
                {
                    $lookup: {
                        from: 'users',
                        let: { roleId: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$role', '$$roleId'] } } },
                            { $count: 'userCount' }
                        ],
                        as: 'userCountData'
                    }
                },
                {
                    $lookup: {
                        from: 'permissions',
                        localField: 'permissions',
                        foreignField: '_id',
                        as: 'permissions'
                    }
                },
                {
                    $project: {
                        name: 1,
                        description: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        permissionCount: { $size: '$permissions' },
                        userCount: { $ifNull: [{ $arrayElemAt: ['$userCountData.userCount', 0] }, 0] }
                    }
                },
                { $sort: { createdAt: sortOrder } },
                { $skip: skip },
                { $limit: pageSize }
            ]),
            Role.countDocuments(searchQuery)
        ]);

        const totalPages = Math.ceil(totalRoles / pageSize);

        reply.send({
            status: 'success',
            message: 'Roles retrieved successfully',
            data: rolesResult,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalRoles,
                limit: pageSize,
            },
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};


exports.getRoleById = async (request, reply) => {
    const { id } = request.params;
    try {
        const role = await Role.findById(id).lean().populate('permissions', 'name');
        if (!role) {
            return reply.code(404).send({
                status: 'error',
                message: 'Role not found',
            });
        }
        reply.send({
            status: 'success',
            message: 'Role retrieved successfully',
            data: role,
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.updateRoleById = async (request, reply) => {
    const { id } = request.params;
    try {
        const role = await Role.findById(id);
        if (!role) {
            return reply.code(404).send({
                status: 'error',
                message: 'Role not found',
            });
        }

        if (role.name === 'admin' || role.name === 'user') {
            return reply.code(403).send({
                status: 'error',
                message: 'Cannot update role with name "admin" or "user"',
            });
        }

        const updatedRole = await Role.findByIdAndUpdate(id, request.body, { new: true });
        if (!updatedRole) {
            return reply.code(404).send({
                status: 'error',
                message: 'Role not found',
            });
        }

        reply.send({
            status: 'success',
            message: 'Role updated successfully',
            data: updatedRole,
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.deleteRoleById = async (request, reply) => {
    const { id } = request.params;
    try {
        const role = await Role.findById(id);
        if (!role) {
            return reply.code(404).send({
                status: 'error',
                message: 'Role not found',
            });
        }

        if (role.name === 'admin' || role.name === 'user') {
            return reply.code(403).send({
                status: 'error',
                message: 'Cannot delete role with name "admin" or "user"',
            });
        }

        await Role.findByIdAndDelete(id);
        reply.send({
            status: 'success',
            message: 'Role deleted successfully',
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.deleteMultipleRoles = async (request, reply) => {
    try {
        const { ids } = request.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ status: 'error', message: 'Invalid or empty ids array' });
        }

        // Find roles to check for protected ones
        const roles = await Role.find({ _id: { $in: ids } });

        if (roles.length === 0) {
            return reply.code(404).send({ status: 'error', message: 'No roles found with provided ids' });
        }

        // Filter out protected roles (admin and user)
        const deletableRoles = roles.filter(role => role.name !== 'admin' && role.name !== 'user');
        const protectedRoles = roles.filter(role => role.name === 'admin' || role.name === 'user');

        if (deletableRoles.length === 0) {
            return reply.code(403).send({
                status: 'error',
                message: 'All provided roles are protected and cannot be deleted.',
            });
        }

        // Delete the allowed roles
        const deletableIds = deletableRoles.map(role => role._id);
        const deleteResult = await Role.deleteMany({ _id: { $in: deletableIds } });

        const message = protectedRoles.length > 0
            ? `Deleted ${deleteResult.deletedCount} roles. Skipped ${protectedRoles.length} protected role(s).`
            : `Deleted ${deleteResult.deletedCount} roles successfully.`;

        reply.send({
            status: 'success',
            message,
            data: {
                deletedCount: deleteResult.deletedCount,
                skippedProtected: protectedRoles.length,
            },
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.assignPermissionsToRole = async (request, reply) => {
    const { roleId } = request.params;
    const { permissionIds } = request.body;

    if (!Array.isArray(permissionIds)) {
        return reply.status(400).send({ message: 'permissionIds must be an array' });
    }

    try {
        const existingPermissions = await Permission.find({ _id: { $in: permissionIds } });

        if (existingPermissions.length !== permissionIds.length) {
            return reply.status(404).send({ message: 'One or more permissions not found' });
        }

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            { permissions: permissionIds },
            { new: true }
        ).populate('permissions');

        if (!updatedRole) {
            return reply.status(404).send({ message: 'Role not found' });
        }

        reply.send(updatedRole);
    } catch (error) {
        console.error(error);
        reply.status(500).send({ message: 'Internal server error' });
    }
};

exports.getPermissionsOfRole = async (request, reply) => {
    const { id } = request.params;
    try {
        const role = await Role.findById(id)
            .populate('permissions', 'name group description order')
            .lean();

        if (!role) {
            return reply.status(404).send({ status: 'error', message: 'Role not found' });
        }

        reply.send({
            status: 'success',
            message: 'Permissions of role retrieved successfully',
            data: role.permissions,
        });
    } catch (error) {
        reply.code(500).send({ status: 'error', message: error.message });
    }
}