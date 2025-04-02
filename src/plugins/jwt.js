const fp = require('fastify-plugin');

async function jwtPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'supersecretkey'
    });

    // Định nghĩa middleware xác thực
    fastify.decorate("authenticate", async function (request, reply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });
}

module.exports = fp(jwtPlugin);