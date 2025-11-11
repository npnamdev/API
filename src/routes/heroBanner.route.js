const heroBannerController = require('../controllers/heroBanner.controller');

async function heroBannerRoutes(fastify, options) {
    // GET /api/hero-banner - Lấy HeroBanner (chỉ có 1 object)
    fastify.get('/hero-banner', heroBannerController.getHeroBanner);

    // POST/PUT /api/hero-banner - Tạo hoặc cập nhật HeroBanner
    fastify.post('/hero-banner', heroBannerController.createOrUpdateHeroBanner);
    fastify.put('/hero-banner', heroBannerController.createOrUpdateHeroBanner);

    // DELETE /api/hero-banner - Xóa HeroBanner
    fastify.delete('/hero-banner', heroBannerController.deleteHeroBanner);
}

module.exports = heroBannerRoutes;