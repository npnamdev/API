const fp = require('fastify-plugin');
const mongoose = require('mongoose');

async function mongooseConnector(fastify) {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        fastify.log.info('MongoDB connected');
    } catch (err) {
        fastify.log.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

module.exports = fp(mongooseConnector);