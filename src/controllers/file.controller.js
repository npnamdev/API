const File = require('../models/file.model');

// Lấy file theo folder
exports.getFilesByFolder = async (req, reply) => {
    const { folderId } = req.params;
    const files = await File.find({ folder: folderId }).sort({ createdAt: -1 });
    reply.send(files);
};

// Upload file (lưu thông tin vào DB)
exports.uploadFile = async (req, reply) => {
    const { name, type, url, size, folder } = req.body;
    const file = await File.create({ name, type, url, size, folder });
    reply.code(201).send(file);
};

// Xóa file
exports.deleteFile = async (req, reply) => {
    const { id } = req.params;
    await File.findByIdAndDelete(id);
    reply.send({ message: 'File deleted' });
};
