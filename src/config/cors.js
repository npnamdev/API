// module.exports = {
//     origin: '*',  // Cho phép tất cả các origin (có thể giới hạn nếu cần)
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Các phương thức HTTP cho phép
//     allowedHeaders: ['Content-Type', 'Authorization'],  // Các header cho phép
//     credentials: true  // Cho phép gửi cookie từ client
// };




const fastifyCors = require('@fastify/cors');

function corsConfig(fastify) {
    fastify.register(fastifyCors, {
        origin: '*',  // Cho phép tất cả các origin (có thể giới hạn nếu cần)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Các phương thức HTTP cho phép
        allowedHeaders: ['Content-Type', 'Authorization'],  // Các header cho phép
        credentials: true  // Cho phép gửi cookie từ client
    });
}

module.exports = corsConfig;