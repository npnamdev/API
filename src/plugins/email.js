const fp = require('fastify-plugin');
const nodemailer = require('nodemailer');

async function emailPlugin(fastify, options) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Sử dụng decorator để thêm hàm gửi email
    fastify.decorate('sendEmail', async ({ to, subject, text, html }) => {
        await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
    });
}

// Bọc plugin với fastify-plugin
module.exports = fp(emailPlugin);
