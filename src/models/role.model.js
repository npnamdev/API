const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    label: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    isSystemRole: { type: Boolean, default: false } 
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;