const Contact = require('../models/contact.model');

exports.createContact = async (req, reply) => {
    try {
        const newContact = new Contact({ ...req.body });
        await newContact.save();
        reply.code(201).send(newContact);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Lỗi khi tạo contact' });
    }
};

exports.getAllContacts = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    // Tìm kiếm theo name hoặc email hoặc subject (bạn có thể thêm trường khác nếu muốn)
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const sortOrder = sort === 'asc' ? 1 : -1;

    const contacts = await Contact.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder });

    const totalContacts = await Contact.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalContacts / pageSize);

    reply.send({
      status: 'success',
      message: 'Contacts retrieved successfully',
      data: contacts,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalContacts,
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error(error);
    reply.code(500).send({
      status: 'error',
      message: error.message || 'Lỗi khi lấy danh sách contacts',
    });
  }
};


exports.getContactById = async (req, reply) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return reply.code(404).send({ error: 'Không tìm thấy contact' });
        reply.send(contact);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Lỗi khi lấy contact' });
    }
};

exports.updateContact = async (req, reply) => {
    try {
        const updatedContact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedContact) return reply.code(404).send({ error: 'Không tìm thấy contact để cập nhật' });
        reply.send(updatedContact);
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Lỗi khi cập nhật contact' });
    }
};

exports.deleteContact = async (req, reply) => {
    try {
        const deletedContact = await Contact.findByIdAndDelete(req.params.id);
        if (!deletedContact) return reply.code(404).send({ error: 'Không tìm thấy contact để xóa' });
        reply.send({ message: 'Xóa contact thành công' });
    } catch (error) {
        console.error(error);
        reply.code(500).send({ error: 'Lỗi khi xóa contact' });
    }
};

exports.deleteMultipleContacts = async (req, reply) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return reply.code(400).send({ error: 'IDs must be a non-empty array' });
        }
        const result = await Contact.deleteMany({ _id: { $in: ids } });
        reply.send({ message: `${result.deletedCount} contacts deleted successfully` });
    } catch (error) {
        reply.code(500).send({ error: error.message });
    }
};
