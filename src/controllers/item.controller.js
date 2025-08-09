const Item = require('../models/item.model');


// Lấy tất cả file/folder theo parentId (null là root)
export const getItemsByParent = async (req, reply) => {
    try {
        const parentId = req.query.parentId === 'null' || !req.query.parentId ? null : req.query.parentId;

        const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
        const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
        const skip = (page - 1) * limit;

        const [total, items] = await Promise.all([
            Item.countDocuments({ parentId }),
            Item.find({ parentId }).sort({ order: 1 }).skip(skip).limit(limit)
        ]);

        const pages = Math.ceil(total / limit);

        return reply.send({
            items,
            total,
            page,
            pages,
        });
    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
}
// export const getItemsByParent = async (req, reply) => {
//     try {
//         const parentId = req.query.parentId === 'null' || !req.query.parentId ? null : req.query.parentId;
//         const items = await Item.find({ parentId }).sort({ order: 1 });
//         return reply.send(items);
//     } catch (err) {
//         req.log.error(err);
//         return reply.status(500).send({ error: "Server error" });
//     }
// };


// Tạo file hoặc folder (dữ liệu JSON fake)
export const createItem = async (req, reply) => {
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

        // Tự động set order = max order trong parent + 1 nếu không truyền order
        let order = body.order;
        if (order == null) {
            const maxOrderItem = await Item.find({ parentId: body.parentId || null }).sort({ order: -1 }).limit(1);
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
};


// Cập nhật tên item
export const updateName = async (req, reply) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return reply.status(400).send({ error: "name is required" });

        const updated = await Item.findByIdAndUpdate(id, { name }, { new: true });
        if (!updated) return reply.status(404).send({ error: "Item not found" });

        return reply.send(updated);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
};

// Xoá item (file/folder), nếu folder thì xoá đệ quy
async function deleteRecursive(id) {
    const children = await Item.find({ parentId: id });
    for (const child of children) {
        await deleteRecursive(child._id);
    }
    await Item.findByIdAndDelete(id);
}

export const deleteItem = async (req, reply) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) return reply.status(404).send({ error: "Item not found" });

        await deleteRecursive(id);
        return reply.send({ success: true });

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
};

// Di chuyển item (thay đổi parentId và order)
export const moveItem = async (req, reply) => {
    try {
        const { id } = req.params;
        const { parentId, order } = req.body;

        if (order == null) return reply.status(400).send({ error: "order is required" });

        const update = {
            parentId: parentId || null,
            order
        };

        const updated = await Item.findByIdAndUpdate(id, update, { new: true });
        if (!updated) return reply.status(404).send({ error: "Item not found" });

        return reply.send(updated);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
};

// Lấy chi tiết 1 item
export const getItemById = async (req, reply) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);
        if (!item) return reply.status(404).send({ error: "Item not found" });

        return reply.send(item);

    } catch (err) {
        req.log.error(err);
        return reply.status(500).send({ error: "Server error" });
    }
};