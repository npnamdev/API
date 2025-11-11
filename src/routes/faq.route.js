const faqController = require('../controllers/faq.controller');

async function faqRoutes(fastify, options) {
    // GET /api/faq - Lấy tất cả FAQs (chỉ có 1 object)
    fastify.get('/faq', faqController.getFaq);
    
    // POST/PUT /api/faq - Tạo hoặc cập nhật toàn bộ FAQ
    fastify.post('/faq', faqController.createOrUpdateFaq);
    fastify.put('/faq', faqController.createOrUpdateFaq);
    
    // POST /api/faq/add - Thêm một câu hỏi mới vào danh sách
    fastify.post('/faq/add', faqController.addFaqItem);
    
    // PUT /api/faq/:faqItemId - Cập nhật một câu hỏi cụ thể
    fastify.put('/faq/:faqItemId', faqController.updateFaqItem);
    
    // DELETE /api/faq/:faqItemId - Xóa một câu hỏi cụ thể
    fastify.delete('/faq/:faqItemId', faqController.deleteFaqItem);
    
    // PUT /api/faq/reorder - Sắp xếp lại thứ tự các câu hỏi
    fastify.put('/faq/reorder', faqController.reorderFaqItems);
    
    // DELETE /api/faq - Xóa toàn bộ FAQ
    fastify.delete('/faq', faqController.deleteAllFaq);
}

module.exports = faqRoutes;