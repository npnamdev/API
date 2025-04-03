// src/middlewares/auth.middleware.js

async function authMiddleware(req, reply) {
    const token = req.cookies.token;

    if (!token) {
        return reply.code(401).send({ message: 'Unauthorized' });
    }

    // Nếu cần giải mã token để lấy thông tin user
    try {
        const decoded = await req.jwtVerify();
        req.user = decoded;
    } catch (err) {
        return reply.code(401).send({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;