require('dotenv').config();
const fastify = require('fastify')({ logger: true });

// Đăng ký plugin
fastify.register(require('./plugins/sensible'));
fastify.register(require('./plugins/mongoose'));

// Đăng ký các routes
fastify.register(require('./routes/user.route'), { prefix: '/api' });
fastify.register(require('./routes/role.route'), { prefix: '/api' });

(async () => {
    try {
        await fastify.listen({ port: process.env.PORT });
        console.log(`\n- 🌟 App running at:`);
        console.log(`- 🚀 Server listening on\x1b[0m \x1b[33mhttp://localhost:${process.env.PORT}\x1b[0m`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})();
