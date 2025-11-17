const automationController = require('../controllers/automation.controller');

async function automationRoutes(fastify) {
    fastify.get('/automations', automationController.getAllAutomations);
    fastify.get('/automations/:id', automationController.getAutomationById);
    fastify.post('/automations', automationController.createAutomation);
    fastify.put('/automations/:id', automationController.updateAutomation);
    fastify.delete('/automations/:id', automationController.deleteAutomation);
    fastify.post('/automations/:id/run', automationController.runAutomation);
}

module.exports = automationRoutes;
