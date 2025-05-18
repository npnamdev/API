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

// const createMedia = async (req, reply) => {
//   try {
//     if (!req.isMultipart()) { return reply.status(400).send({ message: 'No file uploaded' }); }
//     const data = await req.file();
//     const fileBuffer = await data.toBuffer();

//     const uploadStream = () =>
//       new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { folder: 'uploads' },
//           (error, result) => {
//             if (result) {
//               resolve(result);
//             } else {
//               reject(error);
//             }
//           }
//         );
//         streamifier.createReadStream(fileBuffer).pipe(stream);
//       });

//     const uploadResult = await uploadStream();
//     const { url, secure_url, public_id, format, resource_type, width, height, bytes, original_filename } = uploadResult;
//     const newMedia = new Media({
//       url,
//       secure_url,
//       public_id,
//       format,
//       resource_type,
//       width,
//       height,
//       bytes,
//       original_filename
//     });

//     await newMedia.save();

//     reply.status(201).send(newMedia);
//   } catch (err) {
//     reply.status(500).send({ message: 'Error creating media', error: err });
//   }
// };

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

    // Destructure kết quả trả về từ Cloudinary
    const {
      url,
      secure_url,
      public_id,
      format,
      resource_type,
      width,
      height,
      bytes,
    } = uploadResult;

    // Tạo bản ghi media mới
    const newMedia = new Media({
      url,
      secure_url,
      public_id,
      format,
      resource_type,
      width,
      height,
      bytes,
      original_filename: originalFilename,
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
