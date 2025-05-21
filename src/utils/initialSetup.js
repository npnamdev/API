const Role = require('../models/role.model');
const User = require('../models/user.model');
const Permission = require('../models/permission.model');

async function initializeData() {
    try {
        let adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            const allPermissions = await Permission.find({}, '_id');
            adminRole = new Role({
                name: 'admin',
                label: 'Quản trị viên',
                permissions: allPermissions.map(p => p._id),
            });
            await adminRole.save();
            console.log('✅ Admin role created with full permissions');
        }

        let userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
            userRole = new Role({ name: 'user', label: 'Người dùng', permissions: [] });
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
