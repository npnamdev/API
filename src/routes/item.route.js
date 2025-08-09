const itemController = require('../controllers/item.controller');

async function itemRoutes(fastify, options) {
    fastify.get('/items', itemController.getItemsByParent);           // Lấy items theo parentId query
    fastify.get('/items/:id', itemController.getItemById);            // Lấy chi tiết item
    fastify.post('/items', itemController.createItem);                // Tạo file/folder
    fastify.patch('/items/:id/rename', itemController.updateName);    // Cập nhật tên
    fastify.patch('/items/:id/move', itemController.moveItem);        // Di chuyển item (thay đổi parentId, order)
    fastify.delete('/items/:id', itemController.deleteItem);          // Xoá item (đệ quy nếu folder)
}

module.exports = itemRoutes;