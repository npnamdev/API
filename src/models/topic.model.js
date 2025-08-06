const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String, default: '' },
}, { timestamps: true });

const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;