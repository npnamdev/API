const multer = require('fastify-multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
