const courseMaterialController = require("../controllers/courseMaterial.controller");

async function routes(fastify, options) {
    fastify.post("/materials", courseMaterialController.createMaterial);
    fastify.get("/courses/:courseId/materials", courseMaterialController.getMaterialsByCourse);
    fastify.put("/materials/:id", courseMaterialController.updateMaterial);
    fastify.delete("/materials/:id", courseMaterialController.deleteMaterial);

    fastify.put("/courses/:courseId/materials/reorder", courseMaterialController.reorderMaterials);
}

module.exports = routes;
