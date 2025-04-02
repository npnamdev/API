const fp = require('fastify-plugin');

async function sensible(fastify) {
    fastify.register(require('@fastify/sensible'));
}

module.exports = fp(sensible);