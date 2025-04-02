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

module.exports = { getAllRoles, createRole };