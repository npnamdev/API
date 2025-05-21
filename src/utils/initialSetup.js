const Role = require('../models/role.model');
const User = require('../models/user.model');
const Permission = require('../models/permission.model');

async function initializeData() {
    try {
        const permissionsData = [
            { name: 'CREATE_USER', label: 'Create User', group: 'User', description: 'Allows creating a new user', order: 1 },
            { name: 'READ_USER', label: 'Read User', group: 'User', description: 'Allows reading user data', order: 2 },
            { name: 'UPDATE_USER', label: 'Update User', group: 'User', description: 'Allows updating user information', order: 3 },
            { name: 'DELETE_USER', label: 'Delete User', group: 'User', description: 'Allows deleting a user', order: 4 },
            { name: 'CREATE_ROLE', label: 'Create Role', group: 'Role', description: 'Allows creating a new role', order: 1 },
            { name: 'READ_ROLE', label: 'Read Role', group: 'Role', description: 'Allows viewing role details', order: 2 },
            { name: 'UPDATE_ROLE', label: 'Update Role', group: 'Role', description: 'Allows editing role information', order: 3 },
            { name: 'DELETE_ROLE', label: 'Delete Role', group: 'Role', description: 'Allows deleting roles', order: 4 },
            { name: 'ASSIGN_PERMISSIONS_TO_ROLE', label: 'Assign Permissions to Role', group: 'Role', description: 'Allows assigning permissions to a role', order: 5 }
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
