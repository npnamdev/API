const RoleController = require('../controllers/role.controller');

async function roleRoutes(fastify) {
    fastify.get('/roles', RoleController.getRoles);
    fastify.post('/roles', RoleController.createRole);
}

module.exports = roleRoutes;