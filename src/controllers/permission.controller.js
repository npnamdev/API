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
        const { page = 1, limit = 100, search = '', sort = 'asc' } = request.query;
        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;
        const searchQuery = search ? { name: { $regex: search, $options: 'i' } } : {};
        const sortOrder = sort === 'asc' ? 1 : -1;

        // Ưu tiên sort theo order, sau đó mới theo createdAt
        const permissions = await Permission.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ order: sortOrder, createdAt: sortOrder }).lean();

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

exports.createPermissionsBulk = async (request, reply) => {
  try {
    const permissions = request.body.permissions; // mong đợi: { permissions: [{name, group?, description?, order?}, ...] }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return reply.status(400).send({ status: 'error', message: 'Permissions must be a non-empty array' });
    }

    // Kiểm tra trùng tên permission trước khi tạo
    const names = permissions.map(p => p.name);
    const existing = await Permission.find({ name: { $in: names } });
    if (existing.length > 0) {
      return reply.status(400).send({
        status: 'error',
        message: `Some permissions already exist: ${existing.map(p => p.name).join(', ')}`
      });
    }

    const created = await Permission.insertMany(permissions);

    reply.send({
      status: 'success',
      message: 'Permissions created successfully',
      data: created,
    });
  } catch (error) {
    reply.code(500).send({ status: 'error', message: error.message });
  }
};

exports.assignPermissionsToRole = async (req, reply) => {
  try {
    const { roleId } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return reply.status(400).send({
        message: "Permissions must be an array of permission names.",
      });
    }

    // Tìm các permission tương ứng với tên
    const foundPermissions = await Permission.find({
      name: { $in: permissions },
    });

    if (foundPermissions.length !== permissions.length) {
      return reply.status(404).send({
        message: "Some permissions not found.",
      });
    }

    // Cập nhật quyền cho vai trò
    const role = await Role.findByIdAndUpdate(
      roleId,
      { permissions: foundPermissions.map((p) => p._id) },
      { new: true }
    ).populate("permissions");

    if (!role) {
      return reply.status(404).send({
        message: "Role not found.",
      });
    }

    reply.send({
      message: "Permissions updated successfully.",
      data: role,
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({
      message: "Internal server error.",
    });
  }
};
