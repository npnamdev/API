const fp = require('fastify-plugin');

async function jwtPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'supersecretkey'
    });
}

module.exports = fp(jwtPlugin);