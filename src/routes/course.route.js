const courseController = require('../controllers/course.controller');

async function courseRoutes(fastify, options) {
    fastify.get('/courses', courseController.getAllCourses);
    fastify.get('/courses/:id', courseController.getCourseById);
    fastify.get('/courses/slug/:slug', courseController.getCourseBySlug);
    fastify.get('/courses/:id/full-detail', courseController.getCourseFullDetail);
    fastify.post('/courses', courseController.createCourse);
    fastify.put('/courses/:id', courseController.updateCourse);
    fastify.delete('/courses/:id', courseController.deleteCourse);
    fastify.delete('/courses', courseController.deleteMultipleCourses);
    fastify.post('/courses/:id/duplicate', courseController.duplicateCourse);
}

module.exports = courseRoutes;
