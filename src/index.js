require('dotenv').config();
require('./config/cloudinary.config')();
const corsOptions = require('./config/cors');
const fastify = require('fastify')({ logger: false });
const initializeData = require('./utils/initialSetup');

fastify.register(require('@fastify/cors'), corsOptions);
fastify.register(require("fastify-socket.io"), { cors: corsOptions });
fastify.register(require("@fastify/static"), { root: require("path").join(__dirname, "public"), prefix: '/' });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
fastify.register(require('@fastify/rate-limit'));
fastify.register(require('./plugins/sensible'));
fastify.register(require('./plugins/mongoose'));
fastify.register(require('./plugins/jwt'));
fastify.register(require('./plugins/email'));

fastify.register(require('./routes/user.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/role.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/auth.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/permission.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/media.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/notification.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/course.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/lesson.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/category.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/chapter.route'), { prefix: process.env.API_PREFIX || '/api' });

fastify.get('/ping', async (request, reply) => { reply.code(200).send('pong')});
fastify.get("/", (req, reply) => { return reply.sendFile("index.html") });
fastify.get('/view', (req, reply) => { return reply.sendFile('view.html'); });

(async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
        await initializeData();

        console.log(`\n- 🌟 App running at:`);
        console.log(`- 🚀 Server listening on\x1b[0m \x1b[33mhttp://localhost:${process.env.PORT || 8000}\x1b[0m`);

        fastify.io.on("connection", (socket) => {
            console.log("A client connected:", socket.id);
            socket.on("notify", (data) => { console.log("Đã nhận thông báo từ client:", data); });
            socket.on("disconnect", () => { console.log("Client disconnected:", socket.id); });
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})()
