const Role = require('../models/role.model');

async function getAllRoles() {
    try {
        const roles = await Role.find();
        return roles;
    } catch (err) {
        throw new Error('Error fetching roles');
    }
}

async function createRole({ name, description }) {
    try {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            throw new Error('Role already exists');
        }

        const newRole = new Role({ name, description });
        await newRole.save();
        return newRole;
    } catch (err) {
        throw new Error('Error creating role');
    }
}

// Cập nhật một vai trò với các quyền
async function addPermissionsToRole(roleId, permissions) {
    try {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        // Kiểm tra quyền có hợp lệ không
        const validPermissions = await Permission.find({ '_id': { $in: permissions } });
        if (validPermissions.length !== permissions.length) {
            throw new Error('One or more permissions are invalid');
        }

        role.permissions = permissions;  // Cập nhật quyền cho vai trò
        await role.save();
        return role;
    } catch (err) {
        throw new Error('Error adding permissions to role');
    }
}

// Phương thức để xóa quyền khỏi một vai trò
async function removePermissionsFromRole(roleId, permissions) {
    try {
        const role = await Role.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        // Xóa quyền khỏi vai trò
        role.permissions = role.permissions.filter(permission => !permissions.includes(permission.toString()));

        await role.save();
        return role;
    } catch (err) {
        throw new Error('Error removing permissions from role');
    }
}

module.exports = { getAllRoles, createRole, addPermissionsToRole, removePermissionsFromRole };