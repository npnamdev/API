const Category = require('../models/category.model');

exports.createCategory = async (req, reply) => {
  try {
    const category = new Category(req.body);
    const saved = await category.save();
    reply.code(201).send(saved);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.getAllCategories = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;

    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } } // assuming "name" is the field to search
      : {};

    const sortOrder = sort === 'asc' ? 1 : -1;

    const categories = await Category.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder })
      .lean();

    const totalCategories = await Category.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCategories / pageSize);

    reply.send({
      status: 'success',
      message: 'Categories retrieved successfully',
      data: categories,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCategories,
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


exports.getCategoryById = async (req, reply) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return reply.code(404).send({ error: 'Category not found' });
    reply.send(category);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.updateCategory = async (req, reply) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return reply.code(404).send({ error: 'Category not found' });
    reply.send(updated);
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.deleteCategory = async (req, reply) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return reply.code(404).send({ error: 'Category not found' });
    reply.send({ message: 'Category deleted successfully' });
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};

exports.deleteMultipleCategories = async (req, reply) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.code(400).send({ error: 'IDs must be a non-empty array' });
    }
    const result = await Category.deleteMany({ _id: { $in: ids } });
    reply.send({ message: `${result.deletedCount} categories deleted successfully` });
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
};
