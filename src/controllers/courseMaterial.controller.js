const CourseMaterial = require("../models/courseMaterial.model");

// Tạo mới tài liệu cho khoá học
exports.createMaterial = async (req, reply) => {
    try {
        const { courseId, name, url } = req.body;

        if (!courseId) {
            return reply.code(400).send({ error: "courseId is required" });
        }

        const lastMaterial = await CourseMaterial.findOne({ courseId })
            .sort("-order")
            .lean();

        const nextOrder = lastMaterial ? lastMaterial.order + 1 : 1;

        const material = new CourseMaterial({
            courseId,
            name,
            url,
            order: nextOrder,
        });

        await material.save();
        reply.code(201).send(material);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};


// Lấy tất cả tài liệu của 1 khoá học
exports.getMaterialsByCourse = async (req, reply) => {
    try {
        const { courseId } = req.params;
        const materials = await CourseMaterial.find({ courseId }).sort("order");
        reply.send(materials);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};

// Cập nhật tài liệu
exports.updateMaterial = async (req, reply) => {
    try {
        const material = await CourseMaterial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!material) return reply.code(404).send({ error: "Material not found" });
        reply.send(material);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

// Xoá tài liệu
exports.deleteMaterial = async (req, reply) => {
    try {
        const material = await CourseMaterial.findByIdAndDelete(req.params.id);
        if (!material) return reply.code(404).send({ error: "Material not found" });
        reply.send({ message: "Material deleted" });
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};

// Đổi vị trí order của nhiều tài liệu
exports.reorderMaterials = async (req, reply) => {
    try {
        const { courseId, materials } = req.body;
        // materials: [{ id: "xxx", order: 1 }, { id: "yyy", order: 2 }]

        if (!courseId || !Array.isArray(materials)) {
            return reply.code(400).send({ error: "courseId and materials array are required" });
        }

        const bulkOps = materials.map((m) => ({
            updateOne: {
                filter: { _id: m.id, courseId },
                update: { $set: { order: m.order } },
            },
        }));

        await CourseMaterial.bulkWrite(bulkOps);

        const updated = await CourseMaterial.find({ courseId }).sort("order");
        reply.send(updated);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
};
