const User = require('../models/user.model');

function checkPermission(permissionName) {
  return async function (request, reply) {
    try {
      const userId = request.user?.id;
      console.log("check", userId);

      if (!userId) {
        return reply.code(401).send({ status: 'error', message: 'Unauthorized' });
      }

      const user = await User.findById(userId).populate({
        path: 'role',
        populate: { path: 'permissions', select: 'name' },
      });

      if (!user || !user.role) {
        return reply.code(403).send({ status: 'error', message: 'Role not assigned or user not found' });
      }

      const permissions = user.role.permissions.map(p => p.name);

      if (!permissions.includes(permissionName)) {
        return reply.code(403).send({ status: 'error', message: 'Forbidden: You do not have permission' });
      }
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ status: 'error', message: 'Internal server error' });
    }
  };
}

module.exports = { checkPermission };
