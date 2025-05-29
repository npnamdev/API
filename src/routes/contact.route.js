const contactController = require('../controllers/contact.controller');

async function contactRoutes(fastify, options) {
    fastify.post('/contacts', contactController.createContact);
    fastify.get('/contacts', contactController.getAllContacts);
    fastify.get('/contacts/:id', contactController.getContactById);
    fastify.put('/contacts/:id', contactController.updateContact);
    fastify.delete('/contacts/:id', contactController.deleteContact);
}

module.exports = contactRoutes;
