const User = require('../models/user.model');

// Đăng ký người dùng
async function registerUser(data, fastify) {
    const user = new User(data);
    await user.save();

    // Gửi email chào mừng
    await fastify.sendEmail({
        to: user.email,
        subject: 'Welcome to Our Platform!',
        text: `Hello ${user.name},\nWelcome to our platform!`,
        html: `<h1>Hello ${user.name}</h1><p>Welcome to our platform!</p>`
    });

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