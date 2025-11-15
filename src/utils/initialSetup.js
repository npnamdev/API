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
            { name: 'DELETE_IMAGE', label: 'Xoá ảnh', group: 'Image', description: 'Cho phép xoá hình ảnh khỏi hệ thống', order: 3 },

            // Activation permissions
            { name: 'CREATE_ACTIVATION', label: 'Tạo kích hoạt', group: 'Activation', description: 'Cho phép tạo kích hoạt mới', order: 1 },
            { name: 'READ_ACTIVATION', label: 'Xem kích hoạt', group: 'Activation', description: 'Cho phép xem kích hoạt', order: 2 },
            { name: 'UPDATE_ACTIVATION', label: 'Cập nhật kích hoạt', group: 'Activation', description: 'Cho phép cập nhật kích hoạt', order: 3 },
            { name: 'DELETE_ACTIVATION', label: 'Xoá kích hoạt', group: 'Activation', description: 'Cho phép xoá kích hoạt', order: 4 },

            // Auth permissions
            { name: 'CREATE_AUTH', label: 'Tạo xác thực', group: 'Auth', description: 'Cho phép tạo xác thực mới', order: 1 },
            { name: 'READ_AUTH', label: 'Xem xác thực', group: 'Auth', description: 'Cho phép xem xác thực', order: 2 },
            { name: 'UPDATE_AUTH', label: 'Cập nhật xác thực', group: 'Auth', description: 'Cho phép cập nhật xác thực', order: 3 },
            { name: 'DELETE_AUTH', label: 'Xoá xác thực', group: 'Auth', description: 'Cho phép xoá xác thực', order: 4 },

            // Automation permissions
            { name: 'CREATE_AUTOMATION', label: 'Tạo tự động hóa', group: 'Automation', description: 'Cho phép tạo tự động hóa mới', order: 1 },
            { name: 'READ_AUTOMATION', label: 'Xem tự động hóa', group: 'Automation', description: 'Cho phép xem tự động hóa', order: 2 },
            { name: 'UPDATE_AUTOMATION', label: 'Cập nhật tự động hóa', group: 'Automation', description: 'Cho phép cập nhật tự động hóa', order: 3 },
            { name: 'DELETE_AUTOMATION', label: 'Xoá tự động hóa', group: 'Automation', description: 'Cho phép xoá tự động hóa', order: 4 },

            // Category permissions
            { name: 'CREATE_CATEGORY', label: 'Tạo danh mục', group: 'Category', description: 'Cho phép tạo danh mục mới', order: 1 },
            { name: 'READ_CATEGORY', label: 'Xem danh mục', group: 'Category', description: 'Cho phép xem danh mục', order: 2 },
            { name: 'UPDATE_CATEGORY', label: 'Cập nhật danh mục', group: 'Category', description: 'Cho phép cập nhật danh mục', order: 3 },
            { name: 'DELETE_CATEGORY', label: 'Xoá danh mục', group: 'Category', description: 'Cho phép xoá danh mục', order: 4 },

            // Chapter permissions
            { name: 'CREATE_CHAPTER', label: 'Tạo chương', group: 'Chapter', description: 'Cho phép tạo chương mới', order: 1 },
            { name: 'READ_CHAPTER', label: 'Xem chương', group: 'Chapter', description: 'Cho phép xem chương', order: 2 },
            { name: 'UPDATE_CHAPTER', label: 'Cập nhật chương', group: 'Chapter', description: 'Cho phép cập nhật chương', order: 3 },
            { name: 'DELETE_CHAPTER', label: 'Xoá chương', group: 'Chapter', description: 'Cho phép xoá chương', order: 4 },

            // Contact permissions
            { name: 'CREATE_CONTACT', label: 'Tạo liên hệ', group: 'Contact', description: 'Cho phép tạo liên hệ mới', order: 1 },
            { name: 'READ_CONTACT', label: 'Xem liên hệ', group: 'Contact', description: 'Cho phép xem liên hệ', order: 2 },
            { name: 'UPDATE_CONTACT', label: 'Cập nhật liên hệ', group: 'Contact', description: 'Cho phép cập nhật liên hệ', order: 3 },
            { name: 'DELETE_CONTACT', label: 'Xoá liên hệ', group: 'Contact', description: 'Cho phép xoá liên hệ', order: 4 },

            // CourseMaterial permissions
            { name: 'CREATE_COURSEMATERIAL', label: 'Tạo tài liệu khóa học', group: 'CourseMaterial', description: 'Cho phép tạo tài liệu khóa học mới', order: 1 },
            { name: 'READ_COURSEMATERIAL', label: 'Xem tài liệu khóa học', group: 'CourseMaterial', description: 'Cho phép xem tài liệu khóa học', order: 2 },
            { name: 'UPDATE_COURSEMATERIAL', label: 'Cập nhật tài liệu khóa học', group: 'CourseMaterial', description: 'Cho phép cập nhật tài liệu khóa học', order: 3 },
            { name: 'DELETE_COURSEMATERIAL', label: 'Xoá tài liệu khóa học', group: 'CourseMaterial', description: 'Cho phép xoá tài liệu khóa học', order: 4 },

            // CourseNotification permissions
            { name: 'CREATE_COURSENOTIFICATION', label: 'Tạo thông báo khóa học', group: 'CourseNotification', description: 'Cho phép tạo thông báo khóa học mới', order: 1 },
            { name: 'READ_COURSENOTIFICATION', label: 'Xem thông báo khóa học', group: 'CourseNotification', description: 'Cho phép xem thông báo khóa học', order: 2 },
            { name: 'UPDATE_COURSENOTIFICATION', label: 'Cập nhật thông báo khóa học', group: 'CourseNotification', description: 'Cho phép cập nhật thông báo khóa học', order: 3 },
            { name: 'DELETE_COURSENOTIFICATION', label: 'Xoá thông báo khóa học', group: 'CourseNotification', description: 'Cho phép xoá thông báo khóa học', order: 4 },

            // Dropbox permissions
            { name: 'CREATE_DROPBOX', label: 'Tạo dropbox', group: 'Dropbox', description: 'Cho phép tạo dropbox mới', order: 1 },
            { name: 'READ_DROPBOX', label: 'Xem dropbox', group: 'Dropbox', description: 'Cho phép xem dropbox', order: 2 },
            { name: 'UPDATE_DROPBOX', label: 'Cập nhật dropbox', group: 'Dropbox', description: 'Cho phép cập nhật dropbox', order: 3 },
            { name: 'DELETE_DROPBOX', label: 'Xoá dropbox', group: 'Dropbox', description: 'Cho phép xoá dropbox', order: 4 },

            // Enrollment permissions
            { name: 'CREATE_ENROLLMENT', label: 'Tạo đăng ký', group: 'Enrollment', description: 'Cho phép tạo đăng ký mới', order: 1 },
            { name: 'READ_ENROLLMENT', label: 'Xem đăng ký', group: 'Enrollment', description: 'Cho phép xem đăng ký', order: 2 },
            { name: 'UPDATE_ENROLLMENT', label: 'Cập nhật đăng ký', group: 'Enrollment', description: 'Cho phép cập nhật đăng ký', order: 3 },
            { name: 'DELETE_ENROLLMENT', label: 'Xoá đăng ký', group: 'Enrollment', description: 'Cho phép xoá đăng ký', order: 4 },

            // Faq permissions
            { name: 'CREATE_FAQ', label: 'Tạo câu hỏi thường gặp', group: 'Faq', description: 'Cho phép tạo câu hỏi thường gặp mới', order: 1 },
            { name: 'READ_FAQ', label: 'Xem câu hỏi thường gặp', group: 'Faq', description: 'Cho phép xem câu hỏi thường gặp', order: 2 },
            { name: 'UPDATE_FAQ', label: 'Cập nhật câu hỏi thường gặp', group: 'Faq', description: 'Cho phép cập nhật câu hỏi thường gặp', order: 3 },
            { name: 'DELETE_FAQ', label: 'Xoá câu hỏi thường gặp', group: 'Faq', description: 'Cho phép xoá câu hỏi thường gặp', order: 4 },

            // HeroBanner permissions
            { name: 'CREATE_HEROBANNER', label: 'Tạo banner chính', group: 'HeroBanner', description: 'Cho phép tạo banner chính mới', order: 1 },
            { name: 'READ_HEROBANNER', label: 'Xem banner chính', group: 'HeroBanner', description: 'Cho phép xem banner chính', order: 2 },
            { name: 'UPDATE_HEROBANNER', label: 'Cập nhật banner chính', group: 'HeroBanner', description: 'Cho phép cập nhật banner chính', order: 3 },
            { name: 'DELETE_HEROBANNER', label: 'Xoá banner chính', group: 'HeroBanner', description: 'Cho phép xoá banner chính', order: 4 },

            // Item permissions
            { name: 'CREATE_ITEM', label: 'Tạo mục', group: 'Item', description: 'Cho phép tạo mục mới', order: 1 },
            { name: 'READ_ITEM', label: 'Xem mục', group: 'Item', description: 'Cho phép xem mục', order: 2 },
            { name: 'UPDATE_ITEM', label: 'Cập nhật mục', group: 'Item', description: 'Cho phép cập nhật mục', order: 3 },
            { name: 'DELETE_ITEM', label: 'Xoá mục', group: 'Item', description: 'Cho phép xoá mục', order: 4 },

            // Lesson permissions
            { name: 'CREATE_LESSON', label: 'Tạo bài học', group: 'Lesson', description: 'Cho phép tạo bài học mới', order: 1 },
            { name: 'READ_LESSON', label: 'Xem bài học', group: 'Lesson', description: 'Cho phép xem bài học', order: 2 },
            { name: 'UPDATE_LESSON', label: 'Cập nhật bài học', group: 'Lesson', description: 'Cho phép cập nhật bài học', order: 3 },
            { name: 'DELETE_LESSON', label: 'Xoá bài học', group: 'Lesson', description: 'Cho phép xoá bài học', order: 4 },

            // LessonProgress permissions
            { name: 'CREATE_LESSONPROGRESS', label: 'Tạo tiến độ bài học', group: 'LessonProgress', description: 'Cho phép tạo tiến độ bài học mới', order: 1 },
            { name: 'READ_LESSONPROGRESS', label: 'Xem tiến độ bài học', group: 'LessonProgress', description: 'Cho phép xem tiến độ bài học', order: 2 },
            { name: 'UPDATE_LESSONPROGRESS', label: 'Cập nhật tiến độ bài học', group: 'LessonProgress', description: 'Cho phép cập nhật tiến độ bài học', order: 3 },
            { name: 'DELETE_LESSONPROGRESS', label: 'Xoá tiến độ bài học', group: 'LessonProgress', description: 'Cho phép xoá tiến độ bài học', order: 4 },

            // Media permissions
            { name: 'CREATE_MEDIA', label: 'Tạo phương tiện', group: 'Media', description: 'Cho phép tạo phương tiện mới', order: 1 },
            { name: 'READ_MEDIA', label: 'Xem phương tiện', group: 'Media', description: 'Cho phép xem phương tiện', order: 2 },
            { name: 'UPDATE_MEDIA', label: 'Cập nhật phương tiện', group: 'Media', description: 'Cho phép cập nhật phương tiện', order: 3 },
            { name: 'DELETE_MEDIA', label: 'Xoá phương tiện', group: 'Media', description: 'Cho phép xoá phương tiện', order: 4 },

            // Notification permissions
            { name: 'CREATE_NOTIFICATION', label: 'Tạo thông báo', group: 'Notification', description: 'Cho phép tạo thông báo mới', order: 1 },
            { name: 'READ_NOTIFICATION', label: 'Xem thông báo', group: 'Notification', description: 'Cho phép xem thông báo', order: 2 },
            { name: 'UPDATE_NOTIFICATION', label: 'Cập nhật thông báo', group: 'Notification', description: 'Cho phép cập nhật thông báo', order: 3 },
            { name: 'DELETE_NOTIFICATION', label: 'Xoá thông báo', group: 'Notification', description: 'Cho phép xoá thông báo', order: 4 },

            // Oauth permissions
            { name: 'CREATE_OAUTH', label: 'Tạo oauth', group: 'Oauth', description: 'Cho phép tạo oauth mới', order: 1 },
            { name: 'READ_OAUTH', label: 'Xem oauth', group: 'Oauth', description: 'Cho phép xem oauth', order: 2 },
            { name: 'UPDATE_OAUTH', label: 'Cập nhật oauth', group: 'Oauth', description: 'Cho phép cập nhật oauth', order: 3 },
            { name: 'DELETE_OAUTH', label: 'Xoá oauth', group: 'Oauth', description: 'Cho phép xoá oauth', order: 4 },

            // Order permissions
            { name: 'CREATE_ORDER', label: 'Tạo đơn hàng', group: 'Order', description: 'Cho phép tạo đơn hàng mới', order: 1 },
            { name: 'READ_ORDER', label: 'Xem đơn hàng', group: 'Order', description: 'Cho phép xem đơn hàng', order: 2 },
            { name: 'UPDATE_ORDER', label: 'Cập nhật đơn hàng', group: 'Order', description: 'Cho phép cập nhật đơn hàng', order: 3 },
            { name: 'DELETE_ORDER', label: 'Xoá đơn hàng', group: 'Order', description: 'Cho phép xoá đơn hàng', order: 4 },

            // Permission permissions
            { name: 'CREATE_PERMISSION', label: 'Tạo quyền', group: 'Permission', description: 'Cho phép tạo quyền mới', order: 1 },
            { name: 'READ_PERMISSION', label: 'Xem quyền', group: 'Permission', description: 'Cho phép xem quyền', order: 2 },
            { name: 'UPDATE_PERMISSION', label: 'Cập nhật quyền', group: 'Permission', description: 'Cho phép cập nhật quyền', order: 3 },
            { name: 'DELETE_PERMISSION', label: 'Xoá quyền', group: 'Permission', description: 'Cho phép xoá quyền', order: 4 },

            // Section permissions
            { name: 'CREATE_SECTION', label: 'Tạo phần', group: 'Section', description: 'Cho phép tạo phần mới', order: 1 },
            { name: 'READ_SECTION', label: 'Xem phần', group: 'Section', description: 'Cho phép xem phần', order: 2 },
            { name: 'UPDATE_SECTION', label: 'Cập nhật phần', group: 'Section', description: 'Cho phép cập nhật phần', order: 3 },
            { name: 'DELETE_SECTION', label: 'Xoá phần', group: 'Section', description: 'Cho phép xoá phần', order: 4 },

            // Statistic permissions
            { name: 'CREATE_STATISTIC', label: 'Tạo thống kê', group: 'Statistic', description: 'Cho phép tạo thống kê mới', order: 1 },
            { name: 'READ_STATISTIC', label: 'Xem thống kê', group: 'Statistic', description: 'Cho phép xem thống kê', order: 2 },
            { name: 'UPDATE_STATISTIC', label: 'Cập nhật thống kê', group: 'Statistic', description: 'Cho phép cập nhật thống kê', order: 3 },
            { name: 'DELETE_STATISTIC', label: 'Xoá thống kê', group: 'Statistic', description: 'Cho phép xoá thống kê', order: 4 },

            // Testimonial permissions
            { name: 'CREATE_TESTIMONIAL', label: 'Tạo lời chứng thực', group: 'Testimonial', description: 'Cho phép tạo lời chứng thực mới', order: 1 },
            { name: 'READ_TESTIMONIAL', label: 'Xem lời chứng thực', group: 'Testimonial', description: 'Cho phép xem lời chứng thực', order: 2 },
            { name: 'UPDATE_TESTIMONIAL', label: 'Cập nhật lời chứng thực', group: 'Testimonial', description: 'Cho phép cập nhật lời chứng thực', order: 3 },
            { name: 'DELETE_TESTIMONIAL', label: 'Xoá lời chứng thực', group: 'Testimonial', description: 'Cho phép xoá lời chứng thực', order: 4 },

            // Topic permissions
            { name: 'CREATE_TOPIC', label: 'Tạo chủ đề', group: 'Topic', description: 'Cho phép tạo chủ đề mới', order: 1 },
            { name: 'READ_TOPIC', label: 'Xem chủ đề', group: 'Topic', description: 'Cho phép xem chủ đề', order: 2 },
            { name: 'UPDATE_TOPIC', label: 'Cập nhật chủ đề', group: 'Topic', description: 'Cho phép cập nhật chủ đề', order: 3 },
            { name: 'DELETE_TOPIC', label: 'Xoá chủ đề', group: 'Topic', description: 'Cho phép xoá chủ đề', order: 4 },

            // UserCourses permissions
            { name: 'CREATE_USERCOURSES', label: 'Tạo khóa học của người dùng', group: 'UserCourses', description: 'Cho phép tạo khóa học của người dùng mới', order: 1 },
            { name: 'READ_USERCOURSES', label: 'Xem khóa học của người dùng', group: 'UserCourses', description: 'Cho phép xem khóa học của người dùng', order: 2 },
            { name: 'UPDATE_USERCOURSES', label: 'Cập nhật khóa học của người dùng', group: 'UserCourses', description: 'Cho phép cập nhật khóa học của người dùng', order: 3 },
            { name: 'DELETE_USERCOURSES', label: 'Xoá khóa học của người dùng', group: 'UserCourses', description: 'Cho phép xoá khóa học của người dùng', order: 4 },

            // UserGroup permissions
            { name: 'CREATE_USERGROUP', label: 'Tạo nhóm người dùng', group: 'UserGroup', description: 'Cho phép tạo nhóm người dùng mới', order: 1 },
            { name: 'READ_USERGROUP', label: 'Xem nhóm người dùng', group: 'UserGroup', description: 'Cho phép xem nhóm người dùng', order: 2 },
            { name: 'UPDATE_USERGROUP', label: 'Cập nhật nhóm người dùng', group: 'UserGroup', description: 'Cho phép cập nhật nhóm người dùng', order: 3 },
            { name: 'DELETE_USERGROUP', label: 'Xoá nhóm người dùng', group: 'UserGroup', description: 'Cho phép xoá nhóm người dùng', order: 4 }
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
