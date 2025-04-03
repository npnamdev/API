const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    path: { type: String, required: true },
    type: {
        type: String,
        enum: ['image', 'video', 'document', 'audio', 'other'],
        required: true
    },
    size: { type: Number, required: true },
    format: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    tags: [{ type: String }]
}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
