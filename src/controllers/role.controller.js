const RoleService = require('../services/role.service');

async function getRoles(req, reply) {
    try {
        const roles = await RoleService.getAllRoles();
        return reply.send({ roles });
    } catch (err) {
        reply.internalServerError('Error fetching roles');
    }
}

async function createRole(req, reply) {
    try {
        const { name, description } = req.body;
        const newRole = await RoleService.createRole({ name, description });
        return reply.send({ message: 'Role created', role: newRole });
    } catch (err) {
        reply.internalServerError('Error creating role');
    }
}

async function addPermissionsToRole(req, reply) {
    try {
        const { roleId, permissions } = req.body;
        const updatedRole = await RoleService.addPermissionsToRole(roleId, permissions);
        return reply.send({ message: 'Permissions added successfully', role: updatedRole });
    } catch (err) {
        reply.internalServerError('Error adding permissions to role');
    }
}


async function removePermissionsFromRole(req, reply) {
    try {
        const { roleId, permissions } = req.body;
        const updatedRole = await RoleService.removePermissionsFromRole(roleId, permissions);
        return reply.send({ message: 'Permissions removed successfully', role: updatedRole });
    } catch (err) {
        reply.internalServerError('Error removing permissions from role');
    }
}

module.exports = { getRoles, createRole, addPermissionsToRole, removePermissionsFromRole };