const jwt = require('jsonwebtoken');

const authenticate = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({ status: 'error', message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = decoded; // Gán thông tin user vào request
    } catch (err) {
        return reply.code(401).send({ status: 'error', message: 'Invalid token' });
    }
};

module.exports = authenticate;
