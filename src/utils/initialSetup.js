const Role = require('../models/role.model');
const User = require('../models/user.model');
const Permission = require('../models/permission.model');

async function initializeData() {
    try {
        const permissionsData = [
            // User permissions
            { name: 'CREATE_USER', label: 'Tạo người dùng', group: 'User', description: 'Cho phép tạo người dùng mới', order: 1 },
            { name: 'READ_USER', label: 'Xem người dùng', group: 'User', description: 'Cho phép xem dữ liệu người dùng', order: 2 },
            { name: 'UPDATE_USER', label: 'Cập nhật người dùng', group: 'User', description: 'Cho phép cập nhật thông tin người dùng', order: 3 },
            { name: 'DELETE_USER', label: 'Xoá người dùng', group: 'User', description: 'Cho phép xoá người dùng', order: 4 },

            // Role permissions
            { name: 'CREATE_ROLE', label: 'Tạo vai trò', group: 'Role', description: 'Cho phép tạo vai trò mới', order: 1 },
            { name: 'READ_ROLE', label: 'Xem vai trò', group: 'Role', description: 'Cho phép xem chi tiết vai trò', order: 2 },
            { name: 'UPDATE_ROLE', label: 'Cập nhật vai trò', group: 'Role', description: 'Cho phép chỉnh sửa thông tin vai trò', order: 3 },
            { name: 'DELETE_ROLE', label: 'Xoá vai trò', group: 'Role', description: 'Cho phép xoá vai trò', order: 4 },
            { name: 'ASSIGN_PERMISSIONS_TO_ROLE', label: 'Gán quyền cho vai trò', group: 'Role', description: 'Cho phép gán quyền cho một vai trò', order: 5 },

            // Course permissions
            { name: 'CREATE_COURSE', label: 'Tạo khóa học', group: 'Course', description: 'Cho phép tạo khóa học mới', order: 1 },
            { name: 'READ_COURSE', label: 'Xem khóa học', group: 'Course', description: 'Cho phép xem danh sách và chi tiết khóa học', order: 2 },
            { name: 'UPDATE_COURSE', label: 'Cập nhật khóa học', group: 'Course', description: 'Cho phép chỉnh sửa thông tin khóa học', order: 3 },
            { name: 'DELETE_COURSE', label: 'Xoá khóa học', group: 'Course', description: 'Cho phép xoá khóa học', order: 4 },

            // Image permissions
            { name: 'UPLOAD_IMAGE', label: 'Tải ảnh lên', group: 'Image', description: 'Cho phép tải hình ảnh lên hệ thống', order: 1 },
            { name: 'READ_IMAGE', label: 'Xem ảnh', group: 'Image', description: 'Cho phép xem danh sách hình ảnh', order: 2 },
            { name: 'DELETE_IMAGE', label: 'Xoá ảnh', group: 'Image', description: 'Cho phép xoá hình ảnh khỏi hệ thống', order: 3 }
        ];


        for (const perm of permissionsData) {
            const exists = await Permission.findOne({ name: perm.name });
            if (!exists) {
                await Permission.create(perm);
                console.log(`✅ Permission created: ${perm.name}`);
            }
        }

        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            const allPermissions = await Permission.find({}, '_id');
            adminRole = new Role({
                name: 'admin',
                label: 'Quản trị viên',
                isSystemRole: true,
                permissions: allPermissions.map(p => p._id),
            });
            await adminRole.save();
            console.log('✅ Admin role created with full permissions');
        }

        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = new Role({ name: 'user', label: 'Người dùng', isSystemRole: true, permissions: [] });
            await userRole.save();
            console.log('✅ User role created with no permissions');
        }

        const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!existingAdmin) {
            const adminUser = new User({
                username: 'admin',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                fullName: 'Quản trị viên',
                role: adminRole._id,
                isVerified: true,
                isActive: true,
            });
            await adminUser.save();
            console.log('✅ Admin user created with email:', process.env.ADMIN_EMAIL);
        } else {
            console.log('ℹ️ Admin user already exists');
        }
    } catch (error) {
        console.error('❌ Failed to initialize roles or admin user:', error);
    }
}

module.exports = initializeData;
