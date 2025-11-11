const HeroBanner = require('../models/heroBanner.model');

// Tạo hoặc cập nhật HeroBanner (chỉ có 1 instance duy nhất)
exports.createOrUpdateHeroBanner = async (req, reply) => {
    try {
        // Tìm HeroBanner hiện tại (chỉ có 1 bản ghi)
        let heroBanner = await HeroBanner.findOne();
        
        if (heroBanner) {
            // Cập nhật nếu đã tồn tại
            heroBanner = await HeroBanner.findByIdAndUpdate(
                heroBanner._id, 
                req.body, 
                { new: true, runValidators: true }
            );
        } else {
            // Tạo mới nếu chưa tồn tại
            heroBanner = new HeroBanner(req.body);
            await heroBanner.save();
        }

        reply.send({
            status: 'success',
            message: 'HeroBanner saved successfully',
            data: heroBanner
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Lấy HeroBanner (chỉ có 1 object)
exports.getHeroBanner = async (req, reply) => {
    try {
        let heroBanner = await HeroBanner.findOne();
        
        // Nếu chưa có HeroBanner nào, tạo dữ liệu mặc định
        if (!heroBanner) {
            heroBanner = new HeroBanner({
                title: "Khám Phá Thế Giới Kiến Thức",
                subtitle: "Học tập không giới hạn với hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu",
                badge: "#1 Nền tảng học tập trực tuyến",
                bannerImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                ctaButtons: [
                    {
                        text: "Bắt Đầu Học",
                        link: "/courses",
                        type: "primary",
                        icon: "Play"
                    },
                    {
                        text: "Khám Phá Khóa Học",
                        link: "/explore",
                        type: "outline",
                        icon: "ArrowRight"
                    }
                ],
                cards: [
                    {
                        title: "1000+",
                        subtitle: "Khóa học chất lượng",
                        icon: "BookOpen",
                        bgColor: "blue-100",
                        textColor: "blue-800"
                    },
                    {
                        title: "50K+",
                        subtitle: "Học viên đã tin tưởng",
                        icon: "Users",
                        bgColor: "green-100",
                        textColor: "green-800"
                    },
                    {
                        title: "4.8★",
                        subtitle: "Đánh giá từ học viên",
                        icon: "Star",
                        bgColor: "yellow-100",
                        textColor: "yellow-800"
                    }
                ]
            });
            await heroBanner.save();
        }

        reply.send({
            status: 'success',
            message: 'HeroBanner retrieved successfully',
            data: heroBanner
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};

// Xóa HeroBanner
exports.deleteHeroBanner = async (req, reply) => {
    try {
        const heroBanner = await HeroBanner.findOneAndDelete();
        
        if (!heroBanner) {
            return reply.code(404).send({
                status: 'error',
                message: 'HeroBanner not found'
            });
        }

        reply.send({
            status: 'success',
            message: 'HeroBanner deleted successfully'
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};