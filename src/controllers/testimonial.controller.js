const Testimonial = require('../models/testimonial.model');

// Tạo hoặc cập nhật Testimonials (chỉ có 1 instance duy nhất)
exports.createOrUpdateTestimonials = async (req, reply) => {
    try {
        // Tìm Testimonial hiện tại (chỉ có 1 bản ghi)
        let testimonial = await Testimonial.findOne();
        
        if (testimonial) {
            // Cập nhật nếu đã tồn tại
            testimonial = await Testimonial.findByIdAndUpdate(
                testimonial._id, 
                req.body, 
                { new: true, runValidators: true }
            );
        } else {
            // Tạo mới nếu chưa tồn tại
            testimonial = new Testimonial(req.body);
            await testimonial.save();
        }

        reply.send({
            status: 'success',
            message: 'Testimonials saved successfully',
            data: testimonial
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Lấy Testimonials (chỉ có 1 object)
exports.getTestimonials = async (req, reply) => {
    try {
        let testimonial = await Testimonial.findOne();
        
        // Nếu chưa có Testimonials nào, tạo dữ liệu mặc định
        if (!testimonial) {
            testimonial = new Testimonial({
                title: "Cảm nhận của học viên",
                subtitle: "Hàng nghìn học viên đã tin tưởng và đạt được thành công với Quizify. Hãy xem họ nói gì về trải nghiệm học tập tại đây.",
                testimonials: [
                    {
                        name: "Nguyễn Văn Minh",
                        role: "Frontend Developer",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Quizify đã giúp tôi nâng cao kỹ năng React một cách đáng kể. Các khóa học rất thực tế và giảng viên nhiệt tình hướng dẫn.",
                        rating: 5,
                        course: "React.js Master Class"
                    },
                    {
                        name: "Trần Thị Hương",
                        role: "UI/UX Designer",
                        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Tôi đã học được rất nhiều từ khóa học thiết kế UI/UX. Nội dung cập nhật và phương pháp giảng dạy rất dễ hiểu.",
                        rating: 5,
                        course: "UI/UX Design Complete"
                    },
                    {
                        name: "Lê Hoàng Nam",
                        role: "Data Analyst",
                        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Khóa học Python Data Science đã mở ra cánh cửa mới trong sự nghiệp của tôi. Tài liệu phong phú và bài tập thực hành tuyệt vời.",
                        rating: 5,
                        course: "Python Data Science"
                    },
                    {
                        name: "Phạm Thu Linh",
                        role: "Digital Marketer",
                        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Tôi rất ấn tượng với chất lượng khóa học marketing. Các chiến lược được chia sẻ rất hữu ích cho công việc hàng ngày.",
                        rating: 5,
                        course: "Digital Marketing Strategy"
                    },
                    {
                        name: "Võ Đức Thành",
                        role: "Full Stack Developer",
                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Quizify là nền tảng học tập tuyệt vời nhất mà tôi từng trải nghiệm. Cộng đồng hỗ trợ rất tốt và luôn sẵn sàng giúp đỡ.",
                        rating: 5,
                        course: "Full Stack Development"
                    },
                    {
                        name: "Ngô Thị Mai",
                        role: "Product Manager",
                        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
                        content: "Các khóa học rất có tính ứng dụng cao. Tôi đã áp dụng ngay những kiến thức học được vào dự án thực tế với hiệu quả tốt.",
                        rating: 5,
                        course: "Product Management"
                    }
                ]
            });
            await testimonial.save();
        }

        reply.send({
            status: 'success',
            message: 'Testimonials retrieved successfully',
            data: testimonial
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};

// Thêm testimonial mới vào danh sách
exports.addTestimonial = async (req, reply) => {
    try {
        let testimonial = await Testimonial.findOne();
        
        if (!testimonial) {
            // Nếu chưa có, tạo mới với testimonial đầu tiên
            testimonial = new Testimonial({
                title: "Cảm nhận của học viên",
                subtitle: "Hàng nghìn học viên đã tin tưởng và đạt được thành công với Quizify.",
                testimonials: [req.body]
            });
        } else {
            // Thêm vào danh sách testimonials
            testimonial.testimonials.push(req.body);
        }
        
        await testimonial.save();

        reply.send({
            status: 'success',
            message: 'Testimonial added successfully',
            data: testimonial
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Cập nhật một testimonial cụ thể
exports.updateTestimonial = async (req, reply) => {
    try {
        const { testimonialId } = req.params;
        
        const testimonial = await Testimonial.findOne();
        
        if (!testimonial) {
            return reply.code(404).send({
                status: 'error',
                message: 'Testimonials not found'
            });
        }

        const testimonialIndex = testimonial.testimonials.findIndex(
            t => t._id.toString() === testimonialId
        );

        if (testimonialIndex === -1) {
            return reply.code(404).send({
                status: 'error',
                message: 'Testimonial not found'
            });
        }

        // Cập nhật testimonial
        testimonial.testimonials[testimonialIndex] = {
            ...testimonial.testimonials[testimonialIndex].toObject(),
            ...req.body
        };

        await testimonial.save();

        reply.send({
            status: 'success',
            message: 'Testimonial updated successfully',
            data: testimonial
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Xóa một testimonial cụ thể
exports.deleteTestimonial = async (req, reply) => {
    try {
        const { testimonialId } = req.params;
        
        const testimonial = await Testimonial.findOne();
        
        if (!testimonial) {
            return reply.code(404).send({
                status: 'error',
                message: 'Testimonials not found'
            });
        }

        testimonial.testimonials = testimonial.testimonials.filter(
            t => t._id.toString() !== testimonialId
        );

        await testimonial.save();

        reply.send({
            status: 'success',
            message: 'Testimonial deleted successfully',
            data: testimonial
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};

// Xóa toàn bộ Testimonials
exports.deleteAllTestimonials = async (req, reply) => {
    try {
        const testimonial = await Testimonial.findOneAndDelete();
        
        if (!testimonial) {
            return reply.code(404).send({
                status: 'error',
                message: 'Testimonials not found'
            });
        }

        reply.send({
            status: 'success',
            message: 'All testimonials deleted successfully'
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};