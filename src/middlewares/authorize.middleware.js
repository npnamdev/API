const authorize = (...allowedRoles) => {
    return async (request, reply) => {
        if (!request.user || !allowedRoles.includes(request.user.role)) {
            return reply.code(403).send({ status: 'error', message: 'Forbidden' });
        }
    };
};

module.exports = authorize;
