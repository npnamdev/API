const User = require('../models/user.model');

async function getAllUsers() {
    return await User.find();
}

async function createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
}

module.exports = { getAllUsers, createUser };