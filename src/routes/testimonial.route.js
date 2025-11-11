const testimonialController = require('../controllers/testimonial.controller');

async function testimonialRoutes(fastify, options) {
    // GET /api/testimonials - Lấy tất cả testimonials (chỉ có 1 object)
    fastify.get('/', testimonialController.getTestimonials);
    
    // POST/PUT /api/testimonials - Tạo hoặc cập nhật toàn bộ testimonials
    fastify.post('/', testimonialController.createOrUpdateTestimonials);
    fastify.put('/', testimonialController.createOrUpdateTestimonials);
    
    // POST /api/testimonials/add - Thêm một testimonial mới vào danh sách
    fastify.post('/add', testimonialController.addTestimonial);
    
    // PUT /api/testimonials/:testimonialId - Cập nhật một testimonial cụ thể
    fastify.put('/:testimonialId', testimonialController.updateTestimonial);
    
    // DELETE /api/testimonials/:testimonialId - Xóa một testimonial cụ thể
    fastify.delete('/:testimonialId', testimonialController.deleteTestimonial);
    
    // DELETE /api/testimonials - Xóa toàn bộ testimonials
    fastify.delete('/', testimonialController.deleteAllTestimonials);
}

module.exports = testimonialRoutes;