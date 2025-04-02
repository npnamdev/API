const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // Tên quyền, ví dụ: 'CREATE_USER', 'DELETE_COURSE', etc.
    description: { type: String, required: true }, // Mô tả quyền, ví dụ: 'Quyền tạo người dùng', 'Quyền xóa khóa học'
}, { timestamps: true });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;