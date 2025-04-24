require('dotenv').config();
require('./config/cloudinary.config')();
const corsOptions = require('./config/cors');
const fastify = require('fastify')({ logger: false });

fastify.register(require('@fastify/cors'), corsOptions);
fastify.register(require("fastify-socket.io"), { cors: corsOptions });
fastify.register(require("@fastify/static"), { root: require("path").join(__dirname, "public"), prefix: '/' });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
fastify.register(require('@fastify/rate-limit'));
fastify.register(require('./plugins/sensible'));
fastify.register(require('./plugins/mongoose'));
fastify.register(require('./plugins/jwt'));
fastify.register(require('./plugins/email'));
fastify.register(require('./routes/user.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/role.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/permission.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/auth.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/media.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/notification.route'), { prefix: process.env.API_PREFIX || '/api' });

// Mongoose model cho Section
const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    position: { type: Number, required: true },
    title: { type: String, default: '' },
    image: { type: String, default: '' },
    note: { type: String, default: '' },
}, { timestamps: true });

const Section = mongoose.model('Section', SectionSchema);

fastify.get('/api/sections', async (req, reply) => {
    try {
        const sections = await Section.find().sort({ position: 1 });
        reply.send(sections);
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.post('/api/sections', async (req, reply) => {
    const { id, position, title = '', image = '', note = '' } = req.body;

    if (typeof id !== 'number' || typeof position !== 'number') {
        return reply.status(400).send({ success: false, error: 'Invalid id or position' });
    }

    try {
        const exists = await Section.findOne({ id });
        if (exists) {
            return reply.status(400).send({ success: false, error: 'Section already exists' });
        }

        const newSection = new Section({ id, position, title, image, note });
        await newSection.save();
        reply.status(201).send({ success: true, section: newSection });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.put('/api/sections/:id', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    const { position, title, image, note } = req.body;

    if (typeof position !== 'number') {
        return reply.status(400).send({ success: false, error: 'Invalid position' });
    }

    try {
        const section = await Section.findOneAndUpdate(
            { id: sectionId },
            { position, title, image, note },
            { new: true }
        );

        if (!section) {
            return reply.status(404).send({ success: false, error: 'Section not found' });
        }

        reply.send({ success: true, section });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.put('/api/sections/:id/position', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    const { position } = req.body;
    if (typeof position !== 'number') { return reply.status(400).send({ success: false, error: 'Invalid position' }); }
    try {
        const section = await Section.findOneAndUpdate({ id: sectionId }, { position }, { new: true });
        if (!section) { return reply.status(404).send({ success: false, error: 'Section not found' }); }
        reply.send({ success: true, section });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.put('/api/sections/:id/content', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    const { title, image, note } = req.body;

    try {
        const section = await Section.findOneAndUpdate({ id: sectionId }, { title, image, note }, { new: true });
        if (!section) { return reply.status(404).send({ success: false, error: 'Section not found' }); }
        reply.send({ success: true, section });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.delete('/api/sections/:id', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    if (isNaN(sectionId)) { return reply.status(400).send({ success: false, error: 'Invalid section id' }); }
    try {
        const deletedSection = await Section.findOneAndDelete({ id: sectionId });
        if (!deletedSection) { return reply.status(404).send({ success: false, error: 'Section not found' }); }

        reply.send({ success: true, message: 'Section deleted successfully', section: deletedSection });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.post('/api/sections/:id/duplicate', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    const { newId, newPosition } = req.body;

    if (typeof newId !== 'number') {
        return reply.status(400).send({ success: false, error: 'New id is required and must be a number' });
    }

    try {
        const originalSection = await Section.findOne({ id: sectionId });

        if (!originalSection) {
            return reply.status(404).send({ success: false, error: 'Original section not found' });
        }

        const exists = await Section.findOne({ id: newId });
        if (exists) {
            return reply.status(400).send({ success: false, error: 'Section with new id already exists' });
        }

        const duplicatedSection = new Section({
            id: newId,
            position: typeof newPosition === 'number' ? newPosition : originalSection.position,
            title: originalSection.title,
            image: originalSection.image,
            note: originalSection.note,
        });

        await duplicatedSection.save();

        reply.status(201).send({ success: true, section: duplicatedSection });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.post('/api/sections/:id/duplicate', async (req, reply) => {
    const sectionId = parseInt(req.params.id);
    const { newId } = req.body;

    if (typeof newId !== 'number') {
        return reply.status(400).send({ success: false, error: 'New id is required and must be a number' });
    }

    try {
        const original = await Section.findOne({ id: sectionId });
        if (!original) {
            return reply.status(404).send({ success: false, error: 'Original section not found' });
        }

        const exists = await Section.findOne({ id: newId });
        if (exists) {
            return reply.status(400).send({ success: false, error: 'Section with new id already exists' });
        }

        // Bước 1: Dời các section bên dưới xuống 1 vị trí
        await Section.updateMany(
            { position: { $gt: original.position } },
            { $inc: { position: 1 } }
        );

        // Bước 2: Tạo section mới ngay sau original
        const duplicate = new Section({
            id: newId,
            position: original.position + 1,
            title: original.title,
            image: original.image,
            note: original.note
        });

        await duplicate.save();

        reply.status(201).send({ success: true, section: duplicate });
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

fastify.get("/", (req, reply) => { return reply.sendFile("index.html") });
fastify.get("/view/users", (req, reply) => { return reply.sendFile("user.html") });

(async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
        console.log(`\n- 🌟 App running at:`);
        console.log(`- 🚀 Server listening on\x1b[0m \x1b[33mhttp://localhost:${process.env.PORT || 8000}\x1b[0m`);

        fastify.io.on("connection", (socket) => {
            console.log("A client connected:", socket.id);
            socket.on("notify", (data) => { console.log("Đã nhận thông báo từ client:", data); });
            socket.on("disconnect", () => { console.log("Client disconnected:", socket.id); });
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
})()
