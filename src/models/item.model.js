const mongoose = require('mongoose');


const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['file', 'folder'], required: true },
    fileType: { type: String, enum: ['image', 'video', 'audio', 'document'] },
    url: { type: String },
    extension: { type: String },
    size: { type: Number },
    duration: { type: Number }, // duration in seconds for video/audio
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    order: { type: Number, default: 0 }
}, { timestamps: true });


module.exports = mongoose.model('Item', itemSchema);