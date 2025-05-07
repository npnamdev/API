const fp = require('fastify-plugin');

async function jwtPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'supersecretkey',
        cookie: { cookieName: 'refreshToken', signed: false }
    });

    // Middleware xác thực JWT
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            return reply.code(401).send({
                message: 'Unauthorized: Invalid or missing token.' ,
                code: 'ACCESS_TOKEN_EXPIRED'
            });
        }
    });

    // Middleware phân quyền theo role
    fastify.decorate('authorize', (requiredRole) => {
        return async (request, reply) => {
            if (!request.user) {
                return reply.code(401).send({ message: 'Unauthorized: No user data found in token.' });
            }

            if (request.user.role !== requiredRole) {
                return reply.code(403).send({ message: 'Forbidden: Insufficient permissions.' });
            }
        };
    });
}

module.exports = fp(jwtPlugin);
