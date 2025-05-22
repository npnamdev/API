const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const sendEmail = require('../utils/mailer');
const Notification = require('../models/notification.model');
const verifyEmailTemplate = require('../templates/verifyEmailTemplate');
const UAParser = require('ua-parser-js');


exports.login = async (request, reply) => {

    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.code(400).send({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).populate({ path: 'role', select: 'name' });


        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(400).send({ message: 'Invalid credentials' });
        }

        if (user.role && user.role.name.toLowerCase() === 'admin') {
            const ipAddress = request.ip;
            const userAgent = request.headers['user-agent'] || 'Unknown device';
            const parser = new UAParser();
            parser.setUA(userAgent);
            const uaResult = parser.getResult();
            const loginTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

            const notification = new Notification({
                message: `
                    <span class="text-sm text-gray-800">
                    <span class="text-yellow-600 font-medium">Phát hiện đăng nhập từ thiết bị lạ</span> 
                    từ IP <strong class="text-blue-600">${ipAddress}</strong> vào lúc <strong>${loginTime}</strong>.<br/>
                    Thiết bị: <strong>${uaResult.device.vendor || 'Unknown'} ${uaResult.device.model || ''} (${uaResult.device.type || 'Unknown'})</strong>.<br/>
                    Trình duyệt: <strong>${uaResult.browser.name} ${uaResult.browser.version}</strong>.<br/>
                    Hệ điều hành: <strong>${uaResult.os.name} ${uaResult.os.version}</strong>.<br/>
                    Nếu không phải bạn, hãy <span class="text-red-600">đổi mật khẩu ngay</span> để đảm bảo an toàn.
                </span>
                `,
                type: 'warning',
                status: 'unread',
            });

            await notification.save();
            request.server.io.emit('notify', notification);
        }

        // const accessToken = await reply.jwtSign({ id: user._id }, { expiresIn: '1m' });
        // const refreshToken = await reply.jwtSign({ id: user._id }, { expiresIn: '2m' });

        const accessToken = await reply.jwtSign(
            { id: user._id },
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
        );

        const refreshToken = await reply.jwtSign(
            { id: user._id },
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
        );


        reply.setCookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/',
            domain: '.wedly.info',
            maxAge: 7 * 24 * 60 * 60
        });

        return reply.send({ message: 'Login successful', accessToken, user });
    } catch (err) {
        return reply.code(500).send({ message: 'Internal server error' });
    }
};

exports.logout = async (request, reply) => {
    reply.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
        domain: '.wedly.info',
    });
    return reply.send({ message: 'Logged out successfully' });
};

exports.refreshToken = async (request, reply) => {
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) {
        return reply.status(401).send({
            error: 'Refresh token missing',
            code: 'REFRESH_TOKEN_MISSING'
        });
    }

    try {
        const payload = await request.jwtVerify(refreshToken);
        // const accessToken = await reply.jwtSign({ id: payload.id }, { expiresIn: '1m' });
        const accessToken = await reply.jwtSign(
            { id: payload.id },
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
        );
        return reply.send({ accessToken });
    } catch (err) {
        console.error("Refresh token invalid or expired:", err.message);
        return reply.status(403).send({
            error: 'Invalid or expired refresh token',
            code: err.message === 'jwt expired' ? 'REFRESH_TOKEN_EXPIRED' : 'REFRESH_TOKEN_INVALID'
        });
    }
};

exports.register = async (request, reply) => {
    try {
        const { username, email, password, fullName } = request.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return reply.code(400).send({ message: 'Email already registered' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = Date.now() + 5 * 60 * 1000;

        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            return reply.code(500).send({ message: 'Default role not found' });
        }

        const user = new User({
            username,
            email,
            password,
            fullName,
            role: userRole._id,
            verificationToken,
            verificationTokenExpires: new Date(tokenExpires),
        });

        await user.save();

        const verifyUrl = `https://quizify.wedly.info/verify-email?token=${verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'Xác minh email của bạn',
            html: verifyEmailTemplate(username, verifyUrl),
        });

        const notification = new Notification({
            message: `
                <span class="text-sm text-gray-800">
                Một người dùng mới đã đăng ký tài khoản: 
                <strong class="text-blue-600 font-medium">${username}</strong> 
                (<span class="text-green-600">${email}</span>). 
                <span class="text-red-500 font-medium">Vui lòng kiểm tra và xác minh thông tin.</span>
                </span>
            `,
            type: 'info',
            status: 'unread',
        });

        await notification.save();
        request.server.io.emit('notify', notification);

        reply.code(201).send({ message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh trong 5 phút.' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};

exports.verifyEmail = async (request, reply) => {
    try {
        const { token } = request.query;
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return reply.code(400).send({ message: 'Token không hợp lệ' });
        }

        if (user.verificationTokenExpires < Date.now()) {
            return reply.code(400).send({ message: 'Token đã hết hạn' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        reply.code(200).send({ message: 'Xác minh email thành công' });
    } catch (err) {
        reply.code(500).send({ message: err.message });
    }
};



// Làm sau


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