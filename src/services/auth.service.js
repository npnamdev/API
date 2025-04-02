const User = require('../models/user.model');

// Đăng ký người dùng
async function registerUser(data) {
    const user = new User(data);
    await user.save();
    return user;
}

// Đăng nhập người dùng
async function loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    return user;
}

// Lấy thông tin người dùng
async function getUserById(userId) {
    return await User.findById(userId);
}

module.exports = { registerUser, loginUser, getUserById };