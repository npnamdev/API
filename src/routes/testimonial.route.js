const testimonialController = require('../controllers/testimonial.controller');

async function testimonialRoutes(fastify, options) {
    // GET /api/testimonials - Lấy tất cả testimonials (chỉ có 1 object)
    fastify.get('/testimonials', testimonialController.getTestimonials);
    
    // POST/PUT /api/testimonials - Tạo hoặc cập nhật toàn bộ testimonials
    fastify.post('/testimonials', testimonialController.createOrUpdateTestimonials);
    fastify.put('/testimonials', testimonialController.createOrUpdateTestimonials);
    
    // POST /api/testimonials/add - Thêm một testimonial mới vào danh sách
    fastify.post('/testimonials/add', testimonialController.addTestimonial);
    
    // PUT /api/testimonials/:testimonialId - Cập nhật một testimonial cụ thể
    fastify.put('/testimonials:testimonialId', testimonialController.updateTestimonial);
    
    // DELETE /api/testimonials/:testimonialId - Xóa một testimonial cụ thể
    fastify.delete('/testimonials/:testimonialId', testimonialController.deleteTestimonial);
    
    // DELETE /api/testimonials - Xóa toàn bộ testimonials
    fastify.delete('/testimonials', testimonialController.deleteAllTestimonials);
}

module.exports = testimonialRoutes;