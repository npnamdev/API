const categoryController = require('../controllers/category.controller');

async function categoryRoutes(fastify, options) {
    fastify.post('/categories', categoryController.createCategory);
    fastify.get('/categories', categoryController.getAllCategories);
    fastify.get('/categories/:id', categoryController.getCategoryById);
    fastify.put('/categories/:id', categoryController.updateCategory);
    fastify.delete('/categories/:id', categoryController.deleteCategory);
}

module.exports = categoryRoutes;
