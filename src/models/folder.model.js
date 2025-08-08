const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);
