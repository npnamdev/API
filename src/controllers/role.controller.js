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

module.exports = { getRoles, createRole };