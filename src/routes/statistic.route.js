const statisticController = require('../controllers/statistic.controller');

async function statisticRoutes(fastify, options) {
  fastify.get('/statistics', statisticController.getStatistics);
}

module.exports = statisticRoutes;
