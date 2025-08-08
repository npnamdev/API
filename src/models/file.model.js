const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'video', 'audio', 'document'], required: true },
    url: { type: String, required: true },
    size: { type: Number },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
