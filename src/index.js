require('dotenv').config();
const fastify = require('fastify')({ logger: false });
const fastifyCors = require('@fastify/cors');
const fastifyFormbody = require('@fastify/formbody');
const fastifyCookie = require('@fastify/cookie');

fastify.register(fastifyCors, {
    origin: ['http://localhost:5173', 'https://test-cookie-iota.vercel.app', "https://app.wedly.info", "https://wedly.info"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(fastifyCookie);
fastify.register(fastifyFormbody);
fastify.register(require('@fastify/multipart'));

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
fastify.register(require('./routes/media.route'), { prefix: '/api' });

fastify.get('/api/set-cookie', async (req, reply) => {
    reply
        .setCookie('token', '123456', {
            httpOnly: true,
            // secure: process.env.NODE_ENV !== 'development',
            secure: true,
            sameSite: "None",
            path: '/',
            domain: '.wedly.info', // Quan trọng
            maxAge: 24 * 60 * 60
        })
        .send({ message: 'Cookie set successfully' });
});

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
