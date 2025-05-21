const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    label: { type: String, required: false, default: "" },
    group: { type: String, required: false, default: "General" },
    description: { type: String, required: false, default: "" },
    order: { type: Number, required: false, default: 0 },
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
