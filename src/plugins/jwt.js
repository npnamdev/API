const fp = require('fastify-plugin');

async function jwtPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'supersecretkey',
        cookie: { cookieName: 'refreshToken', signed: false }
    });

    fastify.decorate('authenticate', async (request, reply) => {
        try {
            console.log("Check xem gọi vào chưa");

            await request.jwtVerify();
        } catch (err) {
            reply.send(new Error('Unauthorized'));
        }
    });

    fastify.decorate('authorize', (role) => {
        return async (request, reply) => {
            if (!request.user || request.user.role !== role) {
                return reply.code(403).send({ message: 'Forbidden: You do not have the required permission.' });
            }
        };
    });
}

module.exports = fp(jwtPlugin);