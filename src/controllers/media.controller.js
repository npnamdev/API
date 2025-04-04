const cloudinary = require('cloudinary').v2;
const Media = require('../models/media.model');
const streamifier = require('streamifier');

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

    const reuploadResultsult = await uploadStream();
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

// Get all media
const getAllMedia = async (req, reply) => {
  try {
    const medias = await Media.find(); // Fetch all media
    reply.status(200).send(medias);
  } catch (err) {
    reply.status(500).send({ message: 'Error fetching media', error: err });
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
  getAllMedia,
  getMediaById,
  updateMediaById,
  deleteMediaById
};
