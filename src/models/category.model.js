const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
