// src/services/permission.service.js
const Permission = require('../models/permission.model');

async function getAllPermissions() {
    try {
        const permissions = await Permission.find();
        return permissions;
    } catch (err) {
        throw new Error('Error fetching permissions');
    }
}

async function createPermission({ name, description }) {
    try {
        const existingPermission = await Permission.findOne({ name });
        if (existingPermission) {
            throw new Error('Permission already exists');
        }

        const newPermission = new Permission({ name, description });
        await newPermission.save();
        return newPermission;
    } catch (err) {
        throw new Error('Error creating permission');
    }
}

async function deletePermission(permissionId) {
    try {
        const permission = await Permission.findByIdAndDelete(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }
        return permission;
    } catch (err) {
        throw new Error('Error deleting permission');
    }
}

module.exports = { getAllPermissions, createPermission, deletePermission };