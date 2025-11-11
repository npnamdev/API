const Faq = require('../models/faq.model');

// Tạo hoặc cập nhật FAQ (chỉ có 1 instance duy nhất)
exports.createOrUpdateFaq = async (req, reply) => {
    try {
        // Tìm FAQ hiện tại (chỉ có 1 bản ghi)
        let faq = await Faq.findOne();
        
        if (faq) {
            // Cập nhật nếu đã tồn tại
            faq = await Faq.findByIdAndUpdate(
                faq._id, 
                req.body, 
                { new: true, runValidators: true }
            );
        } else {
            // Tạo mới nếu chưa tồn tại
            faq = new Faq(req.body);
            await faq.save();
        }

        reply.send({
            status: 'success',
            message: 'FAQ saved successfully',
            data: faq
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Lấy FAQ (chỉ có 1 object)
exports.getFaq = async (req, reply) => {
    try {
        let faq = await Faq.findOne();
        
        // Nếu chưa có FAQ nào, tạo dữ liệu mặc định
        if (!faq) {
            faq = new Faq({
                title: "Câu hỏi thường gặp",
                subtitle: "Tìm câu trả lời cho những thắc mắc phổ biến về Quizify. Nếu bạn có câu hỏi khác, đừng ngần ngại liên hệ với chúng tôi.",
                faqs: [
                    {
                        question: "Làm thế nào để đăng ký tài khoản trên Quizify?",
                        answer: "Bạn có thể đăng ký tài khoản miễn phí bằng cách click vào nút 'Đăng ký' ở góc phải màn hình. Chỉ cần điền email, mật khẩu và xác nhận email là có thể bắt đầu học ngay.",
                        order: 1
                    },
                    {
                        question: "Tôi có thể học offline không?",
                        answer: "Hiện tại Quizify chưa hỗ trợ tải khóa học để học offline. Tuy nhiên, bạn có thể truy cập khóa học 24/7 trên mọi thiết bị có kết nối internet với tốc độ streaming ổn định.",
                        order: 2
                    },
                    {
                        question: "Có chứng chỉ hoàn thành khóa học không?",
                        answer: "Có, sau khi hoàn thành khóa học và vượt qua các bài kiểm tra, bạn sẽ nhận được chứng chỉ hoàn thành có thể chia sẻ trên LinkedIn và CV của mình.",
                        order: 3
                    },
                    {
                        question: "Chính sách hoàn tiền như thế nào?",
                        answer: "Quizify có chính sách hoàn tiền 100% trong vòng 30 ngày đầu tiên nếu bạn không hài lòng với khóa học. Không cần lý do, chỉ cần liên hệ với đội ngũ hỗ trợ.",
                        order: 4
                    },
                    {
                        question: "Tôi có thể học bao nhiêu khóa học cùng lúc?",
                        answer: "Không có giới hạn số lượng khóa học bạn có thể đăng ký. Tuy nhiên, chúng tôi khuyến nghị tập trung vào 2-3 khóa học cùng lúc để đạt hiệu quả học tập tối ưu.",
                        order: 5
                    },
                    {
                        question: "Có hỗ trợ tương tác với giảng viên không?",
                        answer: "Có, mỗi khóa học đều có diễn đàn thảo luận nơi bạn có thể đặt câu hỏi và nhận phản hồi từ giảng viên. Một số khóa học premium còn có buổi live Q&A định kỳ.",
                        order: 6
                    },
                    {
                        question: "Thiết bị nào có thể truy cập Quizify?",
                        answer: "Quizify hoạt động tốt trên mọi thiết bị: máy tính, laptop, tablet và điện thoại. Giao diện được tối ưu responsive để đảm bảo trải nghiệm học tập mượt mà.",
                        order: 7
                    },
                    {
                        question: "Có giảm giá cho học sinh, sinh viên không?",
                        answer: "Có, Quizify có chương trình ưu đãi đặc biệt dành cho học sinh, sinh viên với mức giảm giá lên đến 50%. Vui lòng liên hệ với đội ngũ hỗ trợ với email edu để được hướng dẫn.",
                        order: 8
                    }
                ]
            });
            await faq.save();
        }

        // Sắp xếp FAQs theo thứ tự
        if (faq.faqs) {
            faq.faqs.sort((a, b) => a.order - b.order);
        }

        reply.send({
            status: 'success',
            message: 'FAQ retrieved successfully',
            data: faq
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};

// Thêm câu hỏi mới vào danh sách
exports.addFaqItem = async (req, reply) => {
    try {
        let faq = await Faq.findOne();
        
        if (!faq) {
            // Nếu chưa có, tạo mới với câu hỏi đầu tiên
            faq = new Faq({
                title: "Câu hỏi thường gặp",
                subtitle: "Tìm câu trả lời cho những thắc mắc phổ biến về Quizify.",
                faqs: [req.body]
            });
        } else {
            // Thêm vào danh sách FAQs
            faq.faqs.push(req.body);
        }
        
        await faq.save();

        reply.send({
            status: 'success',
            message: 'FAQ item added successfully',
            data: faq
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Cập nhật một câu hỏi cụ thể
exports.updateFaqItem = async (req, reply) => {
    try {
        const { faqItemId } = req.params;
        
        const faq = await Faq.findOne();
        
        if (!faq) {
            return reply.code(404).send({
                status: 'error',
                message: 'FAQ not found'
            });
        }

        const faqItemIndex = faq.faqs.findIndex(
            item => item._id.toString() === faqItemId
        );

        if (faqItemIndex === -1) {
            return reply.code(404).send({
                status: 'error',
                message: 'FAQ item not found'
            });
        }

        // Cập nhật FAQ item
        faq.faqs[faqItemIndex] = {
            ...faq.faqs[faqItemIndex].toObject(),
            ...req.body
        };

        await faq.save();

        reply.send({
            status: 'success',
            message: 'FAQ item updated successfully',
            data: faq
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Xóa một câu hỏi cụ thể
exports.deleteFaqItem = async (req, reply) => {
    try {
        const { faqItemId } = req.params;
        
        const faq = await Faq.findOne();
        
        if (!faq) {
            return reply.code(404).send({
                status: 'error',
                message: 'FAQ not found'
            });
        }

        faq.faqs = faq.faqs.filter(
            item => item._id.toString() !== faqItemId
        );

        await faq.save();

        reply.send({
            status: 'success',
            message: 'FAQ item deleted successfully',
            data: faq
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};

// Sắp xếp lại thứ tự các câu hỏi
exports.reorderFaqItems = async (req, reply) => {
    try {
        const { faqItems } = req.body; // Array of {id, order}
        
        const faq = await Faq.findOne();
        
        if (!faq) {
            return reply.code(404).send({
                status: 'error',
                message: 'FAQ not found'
            });
        }

        // Cập nhật thứ tự
        faqItems.forEach(item => {
            const faqItemIndex = faq.faqs.findIndex(
                faqItem => faqItem._id.toString() === item.id
            );
            if (faqItemIndex !== -1) {
                faq.faqs[faqItemIndex].order = item.order;
            }
        });

        await faq.save();

        // Sắp xếp lại theo order
        faq.faqs.sort((a, b) => a.order - b.order);

        reply.send({
            status: 'success',
            message: 'FAQ items reordered successfully',
            data: faq
        });
    } catch (error) {
        reply.code(400).send({
            status: 'error',
            message: error.message
        });
    }
};

// Xóa toàn bộ FAQ
exports.deleteAllFaq = async (req, reply) => {
    try {
        const faq = await Faq.findOneAndDelete();
        
        if (!faq) {
            return reply.code(404).send({
                status: 'error',
                message: 'FAQ not found'
            });
        }

        reply.send({
            status: 'success',
            message: 'All FAQ deleted successfully'
        });
    } catch (error) {
        reply.code(500).send({
            status: 'error',
            message: error.message
        });
    }
};