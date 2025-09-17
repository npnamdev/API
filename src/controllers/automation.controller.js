const Automation = require('../models/automation.model');

// Tạo automation mới
async function createAutomation(req, reply) {
    try {
        const automation = await Automation.create(req.body);
        reply.code(201).send(automation);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
}

// Lấy tất cả automation
async function getAutomations(req, reply) {
    try {
        const automations = await Automation.find();
        reply.send(automations);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
}

// Lấy 1 automation theo id
async function getAutomationById(req, reply) {
    try {
        const automation = await Automation.findById(req.params.id);
        if (!automation) return reply.code(404).send({ error: "Not found" });
        reply.send(automation);
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
}

// Cập nhật automation
async function updateAutomation(req, reply) {
    try {
        const automation = await Automation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!automation) return reply.code(404).send({ error: "Not found" });
        reply.send(automation);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
}

// Xóa automation
async function deleteAutomation(req, reply) {
    try {
        const automation = await Automation.findByIdAndDelete(req.params.id);
        if (!automation) return reply.code(404).send({ error: "Not found" });
        reply.send({ message: "Deleted successfully" });
    } catch (err) {
        reply.code(500).send({ error: err.message });
    }
}

module.exports = {
    createAutomation,
    getAutomations,
    getAutomationById,
    updateAutomation,
    deleteAutomation
};
