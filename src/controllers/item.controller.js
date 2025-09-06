const Item = require('../models/item.model');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');
const mime = require('mime-types');

// const createFileAndUploadToCloudinary = async (req, reply) => {
//     try {
//         if (!req.isMultipart()) {
//             return reply.status(400).send({ message: 'No file uploaded' });
//         }

//         const data = await req.file();
//         const fileBuffer = await data.toBuffer();
//         const originalFilename = data.filename || data.fieldname || 'file';
//         const parentId = data.fields?.parentId?.value || null;

//         // Lấy đuôi file (extension) có dấu chấm, ví dụ ".mp3"
//         const ext = path.extname(originalFilename).toLowerCase();

//         // Danh sách đuôi file theo nhóm
//         const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
//         const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
//         const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
//         const docExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

//         // Xác định resource_type cho Cloudinary
//         let resourceType = 'raw'; // mặc định
//         if (imageExts.includes(ext)) resourceType = 'image';
//         else if (videoExts.includes(ext) || audioExts.includes(ext)) resourceType = 'video';
//         else resourceType = 'raw';

//         const uploadStream = () =>
//             new Promise((resolve, reject) => {
//                 const stream = cloudinary.uploader.upload_stream(
//                     {
//                         folder: 'demo',
//                         public_id: originalFilename,
//                         use_filename: true,
//                         unique_filename: false,
//                         resource_type: resourceType,
//                     },
//                     (error, result) => {
//                         if (error) return reject(error);
//                         resolve(result);
//                     }
//                 );

//                 streamifier.createReadStream(fileBuffer).pipe(stream);
//             });

//         const uploadResult = await uploadStream();

//         // Xác định fileType để lưu vào DB
//         let fileType = 'other';
//         if (imageExts.includes(ext)) fileType = 'image';
//         else if (videoExts.includes(ext)) fileType = 'video';
//         else if (audioExts.includes(ext)) fileType = 'audio';
//         else if (docExts.includes(ext)) fileType = 'document';

//         if (fileType === 'other') {
//             const mimeType = mime.lookup(ext);
//             if (mimeType?.startsWith('image/')) fileType = 'image';
//             else if (mimeType?.startsWith('video/')) fileType = 'video';
//             else if (mimeType?.startsWith('audio/')) fileType = 'audio';
//             else if (
//                 mimeType === 'application/pdf' ||
//                 mimeType?.includes('word') ||
//                 mimeType?.includes('excel')
//             ) {
//                 fileType = 'document';
//             }
//         }

//         // Xác định order
//         let order = req.body?.order;
//         if (order == null) {
//             const maxOrderItem = await Item.find({ parentId: parentId || null })
//                 .sort({ order: -1 })
//                 .limit(1);
//             order = maxOrderItem.length ? maxOrderItem[0].order + 1 : 0;
//         }

//         const newItem = new Item({
//             name: originalFilename,
//             type: 'file',
//             fileType,
//             extension: ext, // lưu đuôi file
//             url: uploadResult.secure_url,
//             size: uploadResult.bytes,
//             parentId,
//             order,
//         });

//         await newItem.save();

//         return reply.status(201).send(newItem);
//     } catch (error) {
//         console.error(error);
//         return reply.status(500).send({ message: 'Upload failed', error });
//     }
// };


const createFileAndUploadToCloudinary = async (req, reply) => {
    try {
        if (!req.isMultipart()) {
            return reply.status(400).send({ message: 'No file uploaded' });
        }

        const data = await req.file();
        const fileBuffer = await data.toBuffer();
        const originalFilename = data.filename || data.fieldname || 'file';
        const parentId = data.fields?.parentId?.value || null;

        // Lấy đuôi file
        const ext = path.extname(originalFilename).toLowerCase();

        // Danh sách đuôi theo nhóm
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];
        const videoExts = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
        const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'];
        const docExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

        // Xác định resource_type cho Cloudinary
        let resourceType: 'image' | 'video' | 'raw' = 'raw';
        if (imageExts.includes(ext)) resourceType = 'image';
        else if (videoExts.includes(ext) || audioExts.includes(ext)) resourceType = 'video';
        else resourceType = 'raw';

        // Upload file lên Cloudinary
        const uploadStream = () =>
            new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'demo',
                        public_id: originalFilename,
                        use_filename: true,
                        unique_filename: false,
                        resource_type: resourceType,
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                streamifier.createReadStream(fileBuffer).pipe(stream);
            });

        const uploadResult: any = await uploadStream();

        // Xác định fileType lưu vào DB
        let fileType: 'image' | 'video' | 'audio' | 'document' | 'other' = 'other';
        if (imageExts.includes(ext)) fileType = 'image';
        else if (videoExts.includes(ext)) fileType = 'video';
        else if (audioExts.includes(ext)) fileType = 'audio';
        else if (docExts.includes(ext)) fileType = 'document';

        if (fileType === 'other') {
            const mimeType = mime.lookup(ext);
            if (mimeType?.startsWith('image/')) fileType = 'image';
            else if (mimeType?.startsWith('video/')) fileType = 'video';
            else if (mimeType?.startsWith('audio/')) fileType = 'audio';
            else if (
                mimeType === 'application/pdf' ||
                mimeType?.includes('word') ||
                mimeType?.includes('excel')
            ) {
                fileType = 'document';
            }
        }

        // --- Xác định order giống như logic bạn gửi
        let order = req.body?.order;

        if ('folder' === 'folder') {
            // folder mới luôn đứng trên cùng
            order = -1;
        } else if (order == null) {
            // file mới, lấy maxOrder + 1
            const maxOrderItem = await Item.find({ parentId: parentId || null })
                .sort({ order: -1 })
                .limit(1);
            order = maxOrderItem.length ? maxOrderItem[0].order + 1 : 0;
        }

        const newItem = new Item({
            name: originalFilename,
            type: 'file',
            fileType,
            extension: ext,
            url: uploadResult.secure_url,
            size: uploadResult.bytes,
            parentId,
            order,
        });

        await newItem.save();

        return reply.status(201).send(newItem);

    } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: 'Upload failed', error });
    }
}


// async function getItemsByParent(req, reply) {
//     try {
//         const parentId = req.query.parentId === 'null' || !req.query.parentId
//             ? null
//             : req.query.parentId;

//         const fileType = req.query.fileType || null; // Lấy fileType từ query nếu có

//         const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
//         const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
//         const skip = (page - 1) * limit;

//         // Tạo query object
//         const query = { parentId };
//         if (fileType && fileType !== 'all') {
//             query.fileType = fileType; // chỉ lọc khi khác 'all'
//         }

//         const [total, items] = await Promise.all([
//             Item.countDocuments(query),
//             Item.find(query)
//                 // .sort({ order: 1 })
//                 .sort({ createdAt: -1, order: 1 })
//                 .skip(skip)
//                 .limit(limit)
//         ]);

//         const pages = Math.ceil(total / limit);

//         return reply.send({
//             items,
//             total,
//             page,
//             pages
//         });
//     } catch (err) {
//         req.log.error(err);
//         return reply.status(500).send({ error: "Server error" });
//     }
// }

// async function getItemsByParent(req, reply) {
//     try {
//         const parentId = req.query.parentId === 'null' || !req.query.parentId
//             ? null
//             : req.query.parentId;

//         const fileType = req.query.fileType || null; // Lấy fileType từ query nếu có

//         const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
//         const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
//         const skip = (page - 1) * limit;

//         // Tạo query object
//         const query = { parentId };
//         if (fileType && fileType !== 'all') {
//             query.fileType = fileType; // chỉ lọc khi khác 'all'
//         }

//         // Lấy param sortBy từ query, mặc định 'createdAt'
//         const sortBy = req.query.sortBy === 'order' ? 'order' : 'createdAt';
//         // Nếu sortBy là order, thứ tự tăng dần; createdAt thì giảm dần
//         const sortOption = {};
//         if (sortBy === 'order') sortOption.order = 1;
//         else sortOption.createdAt = -1;

//         const [total, items] = await Promise.all([
//             Item.countDocuments(query),
//             Item.find(query)
//                 .sort(sortOption)
//                 .skip(skip)
//                 .limit(limit)
//         ]);

//         const pages = Math.ceil(total / limit);

//         return reply.send({
//             items,
//             total,
//             page,
//             pages
//         });
//     } catch (err) {
//         req.log.error(err);
//         return reply.status(500).send({ error: "Server error" });
//     }
// }

async function getItemsByParent(req, reply) {
  try {
    const parentId = req.query.parentId === 'null' || !req.query.parentId
      ? null
      : req.query.parentId;

    const fileType = req.query.fileType || null;

    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    // Tạo query object
    const query = { parentId };

    // Nếu filter fileType, folder vẫn được lấy
    if (fileType && fileType !== 'all') {
      query.$or = [
        { type: 'folder' },       // luôn lấy folder
        { fileType: fileType }    // hoặc file đúng loại
      ];
    }

    // Lấy param sortBy từ query, mặc định 'createdAt'
    const sortBy = req.query.sortBy === 'order' ? 'order' : 'createdAt';
    const sortOption = {};
    if (sortBy === 'order') sortOption.order = 1;
    else sortOption.createdAt = -1;

    const [total, items] = await Promise.all([
      Item.countDocuments(query),
      Item.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
    ]);

    const pages = Math.ceil(total / limit);

    return reply.send({
      items,
      total,
      page,
      pages
    });
  } catch (err) {
    req.log.error(err);
    return reply.status(500).send({ error: "Server error" });
  }
}


async function createItem(req, reply) {
    try {
        const body = req.body;

        if (!body.name || !body.type) {
            return reply.status(400).send({ error: "name and type are required" });
        }

        if (body.type === 'file') {
            if (!body.fileType || !body.url || typeof body.size !== 'number') {
                return reply.status(400).send({ error: "fileType, url, size required for file type" });
            }
        }

        let order = body.order;

        if (body.type === 'folder') {
            // folder mới luôn đứng trên cùng
            order = -1;
        } else if (order == null) {
            // với file, đặt order = maxOrder + 1
            const maxOrderItem = await Item.find({ parentId: body.parentId || null })
                .sort({ order: -1 })
                .limit(1);
            order = maxOrderItem.length ? maxOrderItem[0].order + 1 : 0;
        }

        const newItem = new Item({
            name: body.name,
            type: body.type,
            fileType: body.fileType,
            url: body.url,
            size: body.size,
            parentId: body.parentId || null,
            order
        });

        const savedItem = await newItem.save();
        return reply.status(201).send(savedItem);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}

// Cập nhật tên item
async function updateName(req, reply) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return reply.status(400).send({ error: "name is required" });
        }

        const updated = await Item.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) {
            return reply.status(404).send({ error: "Item not found" });
        }

        return reply.send(updated);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}

// Xoá item (file/folder), nếu folder thì xoá đệ quy
async function deleteRecursive(id) {
    const children = await Item.find({ parentId: id });
    for (const child of children) {
        await deleteRecursive(child._id);
    }
    await Item.findByIdAndDelete(id);
}

async function deleteItem(req, reply) {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) {
            return reply.status(404).send({ error: "Item not found" });
        }

        await deleteRecursive(id);
        return reply.send({ success: true });

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}

// Di chuyển item (thay đổi parentId và order)
async function moveItem(req, reply) {
    try {
        const { id } = req.params;
        const { parentId, order } = req.body;

        if (order == null) {
            return reply.status(400).send({ error: "order is required" });
        }

        // Lấy tất cả items trong cùng parentId
        const items = await Item.find({ parentId: parentId || null }).sort({ order: 1 });

        // Xác định item được di chuyển
        const movingItemIndex = items.findIndex(i => i._id.toString() === id);
        if (movingItemIndex === -1) {
            return reply.status(404).send({ error: "Item not found" });
        }

        // Xóa item khỏi mảng và chèn vào vị trí mới
        const [movingItem] = items.splice(movingItemIndex, 1);
        items.splice(order, 0, movingItem);

        // Cập nhật lại order cho tất cả
        for (let i = 0; i < items.length; i++) {
            items[i].order = i;
            await items[i].save();
        }

        return reply.send({ success: true });

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}

// Lấy chi tiết 1 item
async function getItemById(req, reply) {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) {
            return reply.status(404).send({ error: "Item not found" });
        }

        return reply.send(item);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}

module.exports = {
    getItemsByParent,
    createItem,
    updateName,
    deleteItem,
    moveItem,
    getItemById,
    createFileAndUploadToCloudinary
};
