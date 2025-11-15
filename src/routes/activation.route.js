const controller = require('../controllers/activation.controller');

async function activationRoutes(fastify, options) {
    fastify.get('/activation-codes', controller.getAllActivationCodes);
    fastify.get('/activation-codes/:id', controller.getActivationCodeById);
    fastify.post('/activation-codes', controller.createActivationCode);
    fastify.put('/activation-codes/:id', controller.updateActivationCode);
    fastify.delete('/activation-codes/:id', controller.deleteActivationCode);
    fastify.post('/activations/activate', controller.activateCourse);
}

module.exports = activationRoutes;
