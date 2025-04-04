const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    url: { type: String, required: true },
    secure_url: { type: String },
    public_id: { type: String, required: true },
    format: { type: String },
    resource_type: { type: String },
    width: { type: Number },
    height: { type: Number },
    bytes: { type: Number },
    original_filename: { type: String },
}, {
    timestamps: true
});

const Media = mongoose.model('Media', MediaSchema);

module.exports = Media;



