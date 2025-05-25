const courseController = require('../controllers/course.controller');

async function courseRoutes(fastify, options) {
    fastify.get('/courses', courseController.getAllCourses);
    fastify.get('/courses/:id', courseController.getCourseById);
    fastify.post('/courses', courseController.createCourse);
    fastify.post('/courses/bulk', courseController.createManyCourses);
    fastify.put('/courses/:id', courseController.updateCourse);
    fastify.delete('/courses/:id', courseController.deleteCourse);
}

module.exports = courseRoutes;
