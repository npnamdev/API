const ActivationCode = require('../models/activation.model');
const Enrollment = require('../models/enrollment.model');

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

exports.deleteMultipleActivationCodes = async (req, reply) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ error: 'IDs must be a non-empty array' });
        }
        const result = await ActivationCode.deleteMany({ _id: { $in: ids } });
        reply.send({ message: `${result.deletedCount} activation codes deleted successfully` });
    } catch (err) {
        reply.code(400).send({ error: err.message });
    }
};

exports.activateCourse = async (req, reply) => {
    try {
        const { code, userId } = req.body;

        if (!code || !userId) {
            return reply.code(400).send({
                status: 'error',
                message: 'Code and userId are required'
            });
        }

        // Tìm mã kích hoạt
        const activation = await ActivationCode.findOne({
            code,
            isActive: true,
            expiresAt: { $gt: new Date() },
            used: { $lt: this.quantity } // Chưa dùng hết
        }).populate('course', 'title');

        if (!activation) {
            return reply.code(404).send({
                status: 'error',
                message: 'Invalid or expired activation code'
            });
        }

        // Kiểm tra user đã enroll course chưa
        const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: activation.course._id
        });

        if (existingEnrollment) {
            return reply.code(400).send({
                status: 'error',
                message: 'User already enrolled in this course'
            });
        }

        // Tạo enrollment
        const enrollmentExpiresAt = new Date();
        enrollmentExpiresAt.setDate(enrollmentExpiresAt.getDate() + activation.usageDays);

        const newEnrollment = new Enrollment({
            user: userId,
            course: activation.course._id,
            status: 'active',
            expiresAt: enrollmentExpiresAt
        });

        await newEnrollment.save();

        // Cập nhật activation code
        activation.used += 1;
        if (activation.used >= activation.quantity) {
            activation.status = 'used';
            if (activation.codeType === 'single') {
                activation.isActive = false;
            }
        }
        await activation.save();

        reply.send({
            status: 'success',
            message: 'Course activated successfully',
            data: {
                enrollment: newEnrollment,
                course: activation.course
            }
        });
    } catch (error) {
        console.error(error);
        reply.code(500).send({
            status: 'error',
            message: 'Activation failed'
        });
    }
};

