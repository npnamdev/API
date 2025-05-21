const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    label: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;