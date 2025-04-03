// src/controllers/media.controller.js

const Media = require('../models/media.model');
const cloudinary = require('../utils/cloudinary');

// Tạo một media mới
async function createMedia(req, reply) {
    try {
        const file = req.file;
        

        console.log("check file", file);
        

        // Upload file lên Cloudinary
        // const result = await cloudinary.uploader.upload(file.path, {
        //     folder: 'media',
        // });

        // // Tạo media mới trong MongoDB
        // const newMedia = new Media({
        //     name: file.originalname,
        //     path: result.secure_url, // Lưu URL file từ Cloudinary
        //     type: file.mimetype.split('/')[0], // Ví dụ: image, video
        //     size: file.size,
        //     format: file.mimetype.split('/')[1],
        //     description: req.body.description || '',
        //     status: 'active', // Bạn có thể thay đổi sau
        //     tags: req.body.tags || [],
        // });

        const newMedia = "ok";

        // Lưu vào DB
        // await newMedia.save();
        return reply.code(201).send({ message: 'Media created successfully', media: newMedia });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Error uploading media' });
    }
}

// Lấy tất cả media
async function getAllMedia(req, reply) {
    try {
        const media = await Media.find();
        return reply.send({ media });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Error fetching media' });
    }
}

// Lấy media theo ID
async function getMediaById(req, reply) {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return reply.code(404).send({ message: 'Media not found' });
        }
        return reply.send({ media });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Error fetching media' });
    }
}

// Cập nhật media
async function updateMedia(req, reply) {
    try {
        const updatedData = req.body;
        const media = await Media.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!media) {
            return reply.code(404).send({ message: 'Media not found' });
        }
        return reply.send({ message: 'Media updated successfully', media });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Error updating media' });
    }
}

// Xoá media
async function deleteMedia(req, reply) {
    try {
        const media = await Media.findByIdAndDelete(req.params.id);
        if (!media) {
            return reply.code(404).send({ message: 'Media not found' });
        }

        // Xoá media từ Cloudinary
        const publicId = media.path.split('/').pop().split('.')[0]; // Lấy public_id từ URL
        await cloudinary.uploader.destroy(publicId);

        return reply.send({ message: 'Media deleted successfully' });
    } catch (err) {
        console.error(err);
        return reply.code(500).send({ message: 'Error deleting media' });
    }
}

module.exports = { createMedia, getAllMedia, getMediaById, updateMedia, deleteMedia };
