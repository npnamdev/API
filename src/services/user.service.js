const User = require('../models/user.model');

async function getAllUsers(keyword, status) {
    const filter = {};
    // Tìm kiếm theo từ khóa (name hoặc email)
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } },
        ];
    }

    // Lọc theo trạng thái nếu có
    if (status) {
        filter.status = status;
    }

    return await User.find(filter);
}

async function createUser(userData) {
    const newUser = new User(userData);
    return await newUser.save();
}

module.exports = { getAllUsers, createUser };