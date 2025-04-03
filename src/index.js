require('dotenv').config();
const fastify = require('fastify')({ logger: false });
// const corsConfig = require('./config/cors');
const fastifyCors = require('@fastify/cors');
// const cookieConfig = require('./config/cookie');
// const authMiddleware = require('./middlewares/auth.middleware');
const fastifyFormbody = require('@fastify/formbody');
const fastifyCookie = require('@fastify/cookie');
// const multer = require('fastify-multer');
const upload = require('./utils/upload.js');
const cloudinary = require('./utils/cloudinary.js');

fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

fastify.register(fastifyCookie);
fastify.register(fastifyFormbody);
fastify.register(require('@fastify/multipart'));

fastify.post('/upload', { preHandler: upload.single('image') }, async (req, reply) => {
    try {
        const file = req.file;

        if (!file) {
            return reply.status(400).send({ message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload_stream(
            { folder: 'uploads' },
            (error, result) => {
                if (error) {
                    return reply.status(500).send({ message: 'Upload failed', error });
                }
                return reply.status(200).send({ message: 'Upload successful', url: result.secure_url });
            }
        );

        result.end(file.buffer);
    } catch (error) {
        reply.status(500).send({ message: 'Server error', error });
    }
});

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
fastify.register(require('./routes/media.route'), { prefix: '/api' });

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

fastify.get('/api/set-cookie', async (req, reply) => {
    reply
        .setCookie('token', '123456', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: "None",
            path: '/',
            maxAge: 24 * 60 * 60 * 1000,
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