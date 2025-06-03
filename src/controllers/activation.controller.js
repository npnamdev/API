const ActivationCode = require('../models/activation.model');

exports.getAllActivationCodes = async (req, reply) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            isActive,
            sort = 'desc',
        } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        const searchQuery = {
            ...(search ? { code: { $regex: search, $options: 'i' } } : {}),
            ...(status ? { status } : {}),
            ...(isActive !== undefined ? { isActive: isActive === 'true' } : {}),
        };

        const sortOrder = sort === 'asc' ? 1 : -1;

        const codes = await ActivationCode.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder })
            .populate('course', 'title')
            .populate('createdBy', 'name email');

        const total = await ActivationCode.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / pageSize);

        reply.send({
            status: 'success',
            message: 'Activation codes retrieved successfully',
            data: codes,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalItems: total,
                limit: pageSize,
            },
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message,
        });
    }
};

exports.getActivationCodeById = async (req, reply) => {
    const code = await ActivationCode.findById(req.params.id);
    if (!code) return reply.code(404).send({ message: 'Activation code not found' });
    reply.send(code);
};

exports.createActivationCode = async (req, reply) => {
    try {
        const newCode = new ActivationCode(req.body);
        await newCode.save();
        reply.code(201).send(newCode);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

exports.updateActivationCode = async (req, reply) => {
    try {
        const updated = await ActivationCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return reply.code(404).send({ message: 'Activation code not found' });
        reply.send(updated);
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

exports.deleteActivationCode = async (req, reply) => {
    const deleted = await ActivationCode.findByIdAndDelete(req.params.id);
    if (!deleted) return reply.code(404).send({ message: 'Activation code not found' });
    reply.send({ message: 'Activation code deleted successfully' });
};
