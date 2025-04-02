const UserService = require('../services/user.service');

async function getUsers(req, reply) {
    try {
        const { keyword, status } = req.query;
        const users = await UserService.getAllUsers(keyword, status);
        return reply.send({ users });
    } catch (err) {
        reply.internalServerError('Error fetching users');
    }
}

async function createUser(req, reply) {
    try {
        const { name, email } = req.body;
        const newUser = await UserService.createUser({ name, email });
        return reply.send({ message: 'User created', user: newUser });
    } catch (err) {
        reply.internalServerError('Error creating user');
    }
}

module.exports = { getUsers, createUser };