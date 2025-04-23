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

// API: Lấy danh sách sections
fastify.get('/api/sections', async (req, reply) => {
    try {
        const sections = await Section.find().sort({ position: 1 });
        reply.send(sections);
    } catch (err) {
        reply.status(500).send({ success: false, error: err.message });
    }
});

// API: Thêm section mới
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

// API: Cập nhật section (bao gồm cả position, title, image, note)
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

// API: Xoá section
fastify.delete('/api/sections/:id', async (req, reply) => {
    const sectionId = parseInt(req.params.id);

    if (isNaN(sectionId)) {
        return reply.status(400).send({ success: false, error: 'Invalid section id' });
    }

    try {
        const deletedSection = await Section.findOneAndDelete({ id: sectionId });

        if (!deletedSection) {
            return reply.status(404).send({ success: false, error: 'Section not found' });
        }

        reply.send({ success: true, message: 'Section deleted successfully', section: deletedSection });
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
