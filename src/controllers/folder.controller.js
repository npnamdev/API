const Folder = require('../models/folder.model');
const File = require('../models/file.model');

exports.getFolders = async (req, reply) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;

        const pageNumber = Math.max(1, parseInt(page));
        const pageSize = Math.max(1, parseInt(limit));
        const skip = (pageNumber - 1) * pageSize;

        const searchQuery = search
            ? { name: { $regex: search, $options: 'i' } }
            : {};

        const sortOrder = sort === 'asc' ? 1 : -1;

        const folders = await Folder.find(searchQuery)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: sortOrder });

        const totalFolders = await Folder.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalFolders / pageSize);

        reply.send({
            status: 'success',
            message: 'Folders retrieved successfully',
            data: folders,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalFolders,
                limit: pageSize,
            },
        });
    } catch (err) {
        reply.code(500).send({
            status: 'error',
            message: err.message || 'Server error',
        });
    }
};

// Tạo folder
exports.createFolder = async (req, reply) => {
    const { name } = req.body;
    const folder = await Folder.create({ name });
    reply.code(201).send(folder);
};

// Xóa folder (và file bên trong)
exports.deleteFolder = async (req, reply) => {
    const { id } = req.params;
    await File.deleteMany({ folder: id });
    await Folder.findByIdAndDelete(id);
    reply.send({ message: 'Folder and files deleted' });
};
