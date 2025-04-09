const Role = require('../models/role.model');

const authorize = (permissionName) => {
    return async function (request, reply) {
        const user = request.user;

        if (!user) {
            return reply.status(401).send({ message: 'Unauthorized' });
        }

        const role = await Role.findById(user.role).populate('permissions');

        const hasPermission = role.permissions.some(p => p.name === permissionName);

        if (!hasPermission) {
            return reply.status(403).send({ message: 'Forbidden' });
        }
        return;
    };
};

module.exports = authorize;