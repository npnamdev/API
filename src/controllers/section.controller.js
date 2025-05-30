const Section = require('../models/section.model');

exports.getAllSections = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    // Search theo htmlJson (chỉ khi bạn lưu text trong đó, nếu muốn search tên thì cần field riêng như 'name')
    const searchQuery = search
      ? { htmlJson: { $regex: search, $options: 'i' } }
      : {};

    const sortOrder = sort === 'asc' ? 1 : -1;

    const sections = await Section.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder });

    const totalSections = await Section.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalSections / pageSize);

    reply.send({
      status: 'success',
      message: 'Sections retrieved successfully',
      data: sections,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalSections,
        limit: pageSize,
      },
    });
  } catch (err) {
    reply.code(500).send({
      status: 'error',
      message: err.message || 'Server error',
    });
  }
};


exports.getSectionById = async (request, reply) => {
    try {
        const section = await Section.findById(request.params.id);
        if (!section) return reply.status(404).send({ message: 'Section not found' });
        reply.send(section);
    } catch (err) {
        reply.status(500).send({ error: err.message });
    }
};

exports.createSection = async (request, reply) => {
    try {
        const section = new Section(request.body);
        const saved = await section.save();
        reply.code(201).send(saved);
    } catch (err) {
        reply.status(400).send({ error: err.message });
    }
};

exports.updateSection = async (request, reply) => {
    try {
        const updated = await Section.findByIdAndUpdate(request.params.id, request.body, { new: true });
        if (!updated) return reply.status(404).send({ message: 'Section not found' });
        reply.send(updated);
    } catch (err) {
        reply.status(400).send({ error: err.message });
    }
};

exports.deleteSection = async (request, reply) => {
    try {
        const deleted = await Section.findByIdAndDelete(request.params.id);
        if (!deleted) return reply.status(404).send({ message: 'Section not found' });
        reply.send({ message: 'Section deleted successfully' });
    } catch (err) {
        reply.status(500).send({ error: err.message });
    }
};
