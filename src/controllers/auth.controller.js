const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user.model');

exports.login = async (request, reply) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.code(400).send({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(400).send({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return reply.code(403).send({ message: 'Email not verified' });
        }

        console.log("user", user);

        // Tạo access token bằng @fastify/jwt
        const accessToken = await reply.jwtSign(
            { id: user._id },
            { expiresIn: '15m' }
        );

        // Tạo refresh token bằng @fastify/jwt
        const refreshToken = await reply.jwtSign(
            { id: user._id },
            { expiresIn: '7d' }
        );

        // Set refreshToken as cookie
        reply.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.wedly.info' : undefined,
            maxAge: 7 * 24 * 60 * 60 // 7 ngày
        });

        return reply.send({
            message: 'Login successful',
            accessToken
        });

    } catch (err) {
        console.error('Login error:', err);
        return reply.code(500).send({ message: 'Internal server error' });
    }
};



exports.register = async (request, reply) => {
    try {
        const { username, email, password } = request.body;
        const existingUser = await User.findOne({ email });

        if (existingUser)
            return reply.code(400).send({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = new User({
            username,
            email,
            password: hashedPassword,
            verificationToken,
        });

        await user.save();

        // Gửi email xác thực ở đây

        reply.code(201).send({ message: 'User registered. Please verify your email.' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};

exports.logout = async (request, reply) => {
    reply
        .clearCookie('refreshToken', {
            path: '/',
            domain: '.wedly.info',
            sameSite: 'None',
            secure: true
        })
        .send({ message: 'Logged out successfully' });
};

exports.verifyEmail = async (request, reply) => {
    try {
        const { token } = request.query;
        const user = await User.findOne({ verificationToken: token });

        if (!user)
            return reply.code(400).send({ message: 'Invalid or expired token' });

        user.verificationToken = undefined;
        user.isVerified = true;
        await user.save();

        reply.send({ message: 'Email verified successfully' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};

exports.refreshToken = async (request, reply) => {
    const { token } = request.body;
    if (!token)
        return reply.code(401).send({ message: 'Missing token' });

    jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
        if (err) return reply.code(403).send({ message: 'Invalid refresh token' });

        const accessToken = jwt.sign(
            { id: user.id },
            process.env.ACCESS_SECRET,
            { expiresIn: '15m' }
        );

        reply.send({ accessToken });
    });
};

exports.forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;
        const user = await User.findOne({ email });

        if (!user)
            return reply.code(404).send({ message: 'Email not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 3600000; // 1 giờ
        await user.save();

        // Gửi email có đường link reset
        reply.send({ message: 'Password reset link sent to your email' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};

exports.resetPassword = async (request, reply) => {
    try {
        const { token, newPassword } = request.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() },
        });

        if (!user)
            return reply.code(400).send({ message: 'Invalid or expired token' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;
        await user.save();

        reply.send({ message: 'Password reset successfully' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};

exports.changePassword = async (request, reply) => {
    try {
        const { currentPassword, newPassword } = request.body;
        const user = await User.findById(request.user.id); // request.user set từ middleware authenticate

        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
            return reply.code(400).send({ message: 'Invalid current password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        reply.send({ message: 'Password changed successfully' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};