require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const corsConfig = require('./config/cors');
// const cookieConfig = require('./config/cookie');
const authMiddleware = require('./middlewares/auth.middleware');
const fastifyFormbody = require('@fastify/formbody');
const fastifyCookie = require('@fastify/cookie');

corsConfig(fastify)
// cookieConfig(fastify);
fastify.register(fastifyCookie);
fastify.register(fastifyFormbody);

// fastify.addHook('preHandler', async (req, reply) => {
//     if (['/api/login', '/api/register', '/api/set-cookie', '/api/get-cookie'].includes(req.routerPath)) {
//         return;
//     }
//     await authMiddleware(req, reply);
// });

// Đăng ký các plugin khác
fastify.register(require('./plugins/sensible'));
fastify.register(require('./plugins/mongoose'));
fastify.register(require('./plugins/jwt'));
fastify.register(require('./plugins/email'));

// Đăng ký các route
fastify.register(require('./routes/user.route'), { prefix: '/api' });
fastify.register(require('./routes/role.route'), { prefix: '/api' });
fastify.register(require('./routes/permission.route'), { prefix: '/api' });
fastify.register(require('./routes/auth.route'), { prefix: '/api' });

// Demo api gửi email
fastify.get('/send-email', async (req, reply) => {
    await fastify.sendEmail({
        to: 'user@example.com',
        subject: 'Hello!',
        text: 'This is a test email.',
        html: '<h1>Hello!</h1><p>This is a test email.</p>',
    });
    reply.send({ message: 'Email sent!' });
});

// Tạo route mẫu để thiết lập cookie
fastify.get('/api/set-cookie', async (req, reply) => {
    reply
        .setCookie('token', '123456', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        })
        .send({ message: 'Cookie set successfully' });
});

// Route để đọc cookie
fastify.get('/api/get-cookie', async (req, reply) => {
    const token = req.cookies.token;
    return { token };
});

(async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
        console.log(`\n- 🌟 App running at:`);
        console.log(`- 🚀 Server listening on\x1b[0m \x1b[33mhttp://localhost:${process.env.PORT || 8000}\x1b[0m`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();