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
    const categories = await Category.find();
    reply.send(categories);
  } catch (err) {
    reply.code(500).send({ error: err.message });
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
