const cloudinary = require('cloudinary').v2;
const Media = require('../models/media.model');
const streamifier = require('streamifier');
const imagekit = require('../config/imagekit.config');


const uploadToImageKit = async (req, reply) => {
  try {
    if (!req.isMultipart()) {
      return reply.status(400).send({ message: 'No file uploaded' });
    }

    const data = await req.file();
    const fileBuffer = await data.toBuffer();

    const uploadResponse = await imagekit.upload({
      file: fileBuffer.toString('base64'),
      fileName: data.filename,
      folder: '/uploads',
    });

    const newMedia = new Media({
      url: uploadResponse.url,
      secure_url: uploadResponse.url, // ImageKit thường dùng https
      public_id: uploadResponse.fileId,
      format: uploadResponse.fileExtension,
      resource_type: uploadResponse.fileType,
      width: uploadResponse.width,
      height: uploadResponse.height,
      bytes: uploadResponse.size || uploadResponse.fileSize, // dùng field phù hợp
      original_filename: uploadResponse.name,
    });

    await newMedia.save();

    reply.status(201).send(newMedia);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ message: 'Upload failed', error: err.message });
  }
};

// Create a new media and upload to Cloudinary
const createMedia = async (req, reply) => {
  try {
    if (!req.isMultipart()) { return reply.status(400).send({ message: 'No file uploaded' }); }
    const data = await req.file();
    const fileBuffer = await data.toBuffer();

    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'uploads' },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });

    const uploadResult = await uploadStream();
    const { url, secure_url, public_id, format, resource_type, width, height, bytes, original_filename } = uploadResult;
    const newMedia = new Media({
      url,
      secure_url,
      public_id,
      format,
      resource_type,
      width,
      height,
      bytes,
      original_filename
    });

    await newMedia.save();

    reply.status(201).send(newMedia);
  } catch (err) {
    reply.status(500).send({ message: 'Error creating media', error: err });
  }
};


const getAllMedia = async (req, reply) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = req.query;
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));
    const skip = (pageNumber - 1) * pageSize;

    // Tìm kiếm theo tên media (hoặc bạn có thể thay đổi theo trường phù hợp)
    const searchQuery = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    // Sắp xếp theo ngày tạo, mặc định giảm dần
    const sortOrder = sort === 'asc' ? 1 : -1;

    const medias = await Media.find(searchQuery)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: sortOrder });

    const totalMedias = await Media.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalMedias / pageSize);

    reply.status(200).send({
      status: 'success',
      message: 'Media retrieved successfully',
      data: medias,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalMedias,
        limit: pageSize,
      },
    });
  } catch (err) {
    reply.status(500).send({
      status: 'error',
      message: 'Error fetching media',
      error: err.message || err,
    });
  }
};

// Get a media by ID
const getMediaById = async (req, reply) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return reply.status(404).send({ message: 'Media not found' });
    }
    reply.status(200).send(media);
  } catch (err) {
    reply.status(500).send({ message: 'Error fetching media', error: err });
  }
};

// Update a media by ID
const updateMediaById = async (req, reply) => {
  try {
    const { url, secure_url, public_id, format, resource_type, width, height, bytes, original_filename } = req.body;
    const updatedMedia = await Media.findByIdAndUpdate(req.params.id, {
      url, secure_url, public_id, format, resource_type, width, height, bytes, original_filename
    }, { new: true }); // `new: true` to return the updated document
    if (!updatedMedia) {
      return reply.status(404).send({ message: 'Media not found' });
    }
    reply.status(200).send(updatedMedia);
  } catch (err) {
    reply.status(500).send({ message: 'Error updating media', error: err });
  }
};

// Delete a media by ID
const deleteMediaById = async (req, reply) => {
  try {
    const deletedMedia = await Media.findByIdAndDelete(req.params.id);
    if (!deletedMedia) {
      return reply.status(404).send({ message: 'Media not found' });
    }
    reply.status(200).send({ message: 'Media deleted successfully' });
  } catch (err) {
    reply.status(500).send({ message: 'Error deleting media', error: err });
  }
};

module.exports = {
  createMedia,
  uploadToImageKit,
  getAllMedia,
  getMediaById,
  updateMediaById,
  deleteMediaById
};
