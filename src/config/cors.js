const fastifyCors = require('@fastify/cors');

function corsConfig(fastify) {
    fastify.register(fastifyCors, {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    });
}

module.exports = corsConfig;