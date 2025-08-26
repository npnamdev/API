const enrollmentController = require('../controllers/enrollment.controller');

async function enrollmentRoutes(fastify) {
  // CRUD cơ bản
  fastify.post('/enrollments', enrollmentController.createEnrollment);
  fastify.get('/enrollments', enrollmentController.getAllEnrollments);
  fastify.get('/enrollments/user/:userId', enrollmentController.getEnrollmentsByUser);
  fastify.put('/enrollments/:enrollmentId/progress', enrollmentController.updateProgress);
  fastify.delete('/enrollments/:enrollmentId', enrollmentController.deleteEnrollment);

  // Route mới: lấy "khóa học của tôi" kèm tiến trình
  fastify.get('/my-courses/:userId', enrollmentController.getMyCourses);
}

module.exports = enrollmentRoutes;