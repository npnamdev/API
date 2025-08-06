const topicController = require('../controllers/topic.controller');

async function topicRoutes(fastify, options) {
    fastify.post('/topics', topicController.createTopic);
    fastify.get('/topics', topicController.getAllTopics);
    fastify.get('/topics/:id', topicController.getTopicById);
    fastify.put('/topics/:id', topicController.updateTopic);
    fastify.delete('/topics/:id', topicController.deleteTopic);
}

module.exports = topicRoutes;
