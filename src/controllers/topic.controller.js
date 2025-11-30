const Topic = require('../models/topic.model');

exports.createTopic = async (req, reply) => {
  try {
    const topic = new Topic(req.body);
    const saved = await topic.save();
    reply.code(201).send(saved);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.getAllTopics = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const sortOrder = sort === 'asc' ? 1 : -1;

    const topics = await Topic.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder })
      .lean();

    const totalTopics = await Topic.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalTopics / pageSize);

    reply.send({
      status: 'success',
      message: 'Topics retrieved successfully',
      data: topics,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalTopics,
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

exports.getTopicById = async (req, reply) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return reply.code(404).send({ error: 'Topic not found' });
    reply.send(topic);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.updateTopic = async (req, reply) => {
  try {
    const updated = await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return reply.code(404).send({ error: 'Topic not found' });
    reply.send(updated);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.deleteTopic = async (req, reply) => {
  try {
    const deleted = await Topic.findByIdAndDelete(req.params.id);
    if (!deleted) return reply.code(404).send({ error: 'Topic not found' });
    reply.send({ message: 'Topic deleted successfully' });
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.deleteMultipleTopics = async (req, reply) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ error: 'IDs must be a non-empty array' });
    }
    const result = await Topic.deleteMany({ _id: { $in: ids } });
    reply.send({ message: `${result.deletedCount} topics deleted successfully` });
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};
