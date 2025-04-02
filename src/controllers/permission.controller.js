// src/controllers/permission.controller.js
const PermissionService = require('../services/permission.service');

async function getPermissions(req, reply) {
    try {
        const permissions = await PermissionService.getAllPermissions();
        return reply.send({ permissions });
    } catch (err) {
        reply.internalServerError('Error fetching permissions');
    }
}

async function createPermission(req, reply) {
    try {
        const { name, description } = req.body;
        const newPermission = await PermissionService.createPermission({ name, description });
        return reply.send({ message: 'Permission created', permission: newPermission });
    } catch (err) {
        reply.internalServerError('Error creating permission');
    }
}

async function deletePermission(req, reply) {
    try {
        const { permissionId } = req.params;  // Nhận permissionId từ tham số URL
        const deletedPermission = await PermissionService.deletePermission(permissionId);
        return reply.send({ message: 'Permission deleted', permission: deletedPermission });
    } catch (err) {
        reply.internalServerError('Error deleting permission');
    }
}

module.exports = { getPermissions, createPermission, deletePermission };