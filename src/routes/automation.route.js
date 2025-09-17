const {
    createAutomation,
    getAutomations,
    getAutomationById,
    updateAutomation,
    deleteAutomation
} = require('../controllers/automation.controller');

async function automationRoutes(fastify) {
    fastify.post('/automations', createAutomation);
    fastify.get('/automations', getAutomations);
    fastify.get('/automations/:id', getAutomationById);
    fastify.put('/automations/:id', updateAutomation);
    fastify.delete('/automations/:id', deleteAutomation);
}

module.exports = automationRoutes;
