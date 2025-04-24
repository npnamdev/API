const fp = require('fastify-plugin');

async function jwtPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'supersecretkey',
        cookie: {
            cookieName: 'refreshToken',
            signed: false
          }
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(new Error('Unauthorized'));
        }
    });
}

module.exports = fp(jwtPlugin);