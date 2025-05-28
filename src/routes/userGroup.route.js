const userGroupController = require('../controllers/userGroup.controller');

async function userGroupRoutes(fastify, options) {
  fastify.get('/user-groups', userGroupController.getAllUserGroups);
  fastify.get('/user-groups/:id', userGroupController.getUserGroupById);
  fastify.post('/user-groups', userGroupController.createUserGroup);
  fastify.put('/user-groups/:id', userGroupController.updateUserGroup);
  fastify.delete('/user-groups/:id', userGroupController.deleteUserGroup);
}

module.exports = userGroupRoutes;
