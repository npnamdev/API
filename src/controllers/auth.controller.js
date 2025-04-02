const AuthService = require('../services/auth.service');

// Đăng ký
async function register(req, reply) {
    try {
        const user = await AuthService.registerUser(req.body);
        reply.send({ message: 'User registered', user });
    } catch (err) {
        reply.internalServerError('Registration failed');
    }
}

// Đăng nhập
async function login(req, reply) {
    try {
        const { email, password } = req.body;
        const user = await AuthService.loginUser(email, password);
        const token = reply.jwtSign({ userId: user._id });
        reply.send({ message: 'Login successful', token });
    } catch (err) {
        reply.unauthorized('Invalid email or password');
    }
}

// Lấy thông tin người dùng
async function getProfile(req, reply) {
    try {
        const user = await AuthService.getUserById(req.user.userId);
        reply.send({ user });
    } catch (err) {
        reply.internalServerError('Failed to fetch profile');
    }
}

module.exports = { register, login, getProfile };