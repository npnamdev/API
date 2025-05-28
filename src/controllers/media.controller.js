const cloudinary = require('cloudinary').v2;
const Media = require('../models/media.model');
const streamifier = require('streamifier');

const imagekit = require('../config/imagekit.config');
const uploadcare = require('../config/uploadcare.config');

const uploadToUploadcare = async (req, reply) => {
  try {
    if (!req.isMultipart()) {
      return reply.status(400).send({ message: 'No file uploaded' });
    }

    const data = await req.file();
    const buffer = await data.toBuffer();

    const result = await uploadcare.uploadFile(buffer, {
      fileName: data.filename,
    });

    const imageInfo = result.imageInfo || {};

    const newMedia = new Media({
      url: result.cdnUrl,
      secure_url: result.cdnUrl, // vì là HTTPS
      public_id: result.uuid,
      format: imageInfo.format || result.mimeType?.split('/')[1], // fallback
      resource_type: result.mimeType,
      width: imageInfo.width,
      height: imageInfo.height,
      bytes: result.size,
      original_filename: result.originalFilename || data.filename,
    });

    await newMedia.save();

    reply.status(201).send(newMedia);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ message: 'Upload failed', error: err.message });
  }
};

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

const createMedia = async (req, reply) => {
  try {
    if (!req.isMultipart()) {
      return reply.status(400).send({ message: 'No file uploaded' });
    }

    const data = await req.file(); // lấy file từ multipart
    const fileBuffer = await data.toBuffer(); // lấy nội dung buffer
    const originalFilename = data.filename || 'file'; // fallback nếu không có tên

    // Cloudinary upload stream
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'uploads',
            public_id: originalFilename.split('.')[0], // đặt tên file không có đuôi mở rộng
            use_filename: true,
            unique_filename: false, // giữ tên gốc, không thêm chuỗi ngẫu nhiên
            resource_type: 'auto', // tự động nhận diện (ảnh, video, v.v.)
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
      });

    const uploadResult = await uploadStream();

    const newMedia = new Media({
      url: uploadResult.url,
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      original_filename: originalFilename,

      duration: uploadResult.duration,
      frame_rate: uploadResult.frame_rate,
      bit_rate: uploadResult.bit_rate,

      audio: uploadResult.audio || undefined,
      video: uploadResult.video || undefined,
    });


    await newMedia.save();

    reply.status(201).send(newMedia);
  } catch (err) {
    console.error('[createMedia error]', err);
    reply.status(500).send({ message: 'Error creating media', error: err.message });
  }
};


const getAllMedia = async (req, reply) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sort === 'asc' ? 1 : -1;
    const search = req.query.search || '';
    const searchFields = req.query.searchFields || '';

    const skip = (page - 1) * limit;

    const excludeFields = [
      'page',
      'limit',
      'sort',
      'sortBy',
      'search',
      'searchFields',
    ];

    // Lọc các trường query động (ngoại trừ excludeFields)
    const filterConditions = [];

    for (const key in req.query) {
      if (!excludeFields.includes(key)) {
        filterConditions.push({ [key]: req.query[key] });
      }
    }

    // Lọc search trên nhiều trường (searchFields: "title,description")
    if (search && searchFields) {
      const fields = searchFields.split(',').map(f => f.trim());
      const searchConditions = fields.map(field => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      filterConditions.push({ $or: searchConditions });
    }

    // Kết hợp các điều kiện
    const finalFilter = filterConditions.length > 0 ? { $and: filterConditions } : {};

    // Truy vấn database
    const totalMedias = await Media.countDocuments(finalFilter);
    const medias = await Media.find(finalFilter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    // Trả kết quả
    reply.status(200).send({
      status: 'success',
      message: 'Media retrieved successfully',
      data: medias,
      pagination: {
        totalItems: totalMedias,
        currentPage: page,
        totalPages: Math.ceil(totalMedias / limit),
        limit,
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

// Delete multiple medias by IDs
const deleteManyMedia = async (req, reply) => {
  try {
    const { ids } = req.body; // expect: { ids: ["id1", "id2", ...] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return reply.status(400).send({ message: 'Danh sách ID không hợp lệ' });
    }

    const result = await Media.deleteMany({ _id: { $in: ids } });

    reply.status(200).send({
      message: 'Xoá media thành công',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    reply.status(500).send({ message: 'Lỗi khi xoá media', error: err });
  }
};

module.exports = {
  createMedia,
  uploadToImageKit,
  uploadToUploadcare,
  getAllMedia,
  getMediaById,
  deleteMediaById,
  deleteManyMedia
};
