const { getUserCoursesWithProgress } = require('../controllers/userCourses.controller.js');

async function userCoursesRoutes(fastify, opts) {
  fastify.get('/users/:userId/courses', getUserCoursesWithProgress);
}

module.exports = userCoursesRoutes;