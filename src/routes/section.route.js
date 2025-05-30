const sectionController = require('../controllers/section.controller');

async function sectionRoutes(fastify, options) {
  fastify.get('/sections', sectionController.getAllSections);
  fastify.get('/sections/:id', sectionController.getSectionById);
  fastify.post('/sections', sectionController.createSection);
  fastify.put('/sections/:id', sectionController.updateSection);
  fastify.delete('/sections/:id', sectionController.deleteSection);
}

module.exports = sectionRoutes;
