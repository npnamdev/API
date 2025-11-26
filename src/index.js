require('dotenv').config();
require('./config/cloudinary.config')();
const corsOptions = require('./config/cors');
const fastify = require('fastify')({ logger: false });
const initializeData = require('./utils/initialSetup');
const cloudinary = require('cloudinary');

fastify.register(require('@fastify/cors'), corsOptions);
fastify.register(require("fastify-socket.io"), { cors: corsOptions });
fastify.register(require("@fastify/static"), { root: require("path").join(__dirname, "public"), prefix: '/' });
fastify.register(require('@fastify/cookie'));

fastify.register(require('@fastify/oauth2'), {
  name: 'googleOAuth2',
  scope: ['profile', 'email'],
  credentials: {
    client: { id: process.env.GOOGLE_CLIENT_ID, secret: process.env.GOOGLE_CLIENT_SECRET },
    auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/login/google',
  callbackUri: process.env.GOOGLE_CALLBACK_URI,
  callbackUriParams: { access_type: 'offline', prompt: 'select_account' },
  pkce: 'S256',
});

fastify.register(require('@fastify/oauth2'), {
  name: 'githubOAuth2',
  scope: ['user:email'],
  credentials: {
    client: {
      id: process.env.GITHUB_CLIENT_ID,
      secret: process.env.GITHUB_CLIENT_SECRET,
    },
    auth: {
      authorizeHost: 'https://github.com',
      authorizePath: '/login/oauth/authorize',
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
    },
  },
  startRedirectPath: '/login/github',
  callbackUri: 'https://api.wedly.info/login/github/callback',
  authorizeParams: {
    prompt: 'login',
  },
});

fastify.register(require('@fastify/formbody'));

// fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 100 * 1024 * 1024 } });

fastify.register(require('@fastify/rate-limit'));
fastify.register(require('./plugins/sensible'));
fastify.register(require('./plugins/mongoose'));
fastify.register(require('./plugins/jwt'));
fastify.register(require('./plugins/email'));
fastify.register(require('./routes/user.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/role.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/auth.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/permission.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/media.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/notification.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/course.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/lesson.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/category.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/topic.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/chapter.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/userGroup.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/contact.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/order.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/section.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/dropbox.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/activation.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/statistic.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/item.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/enrollment.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/courseMaterial.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/courseNotification.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/automation.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/cart.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/heroBanner.route'), { prefix: (process.env.API_PREFIX || '/api') });
fastify.register(require('./routes/testimonial.route'), { prefix: (process.env.API_PREFIX || '/api') });
fastify.register(require('./routes/faq.route'), { prefix: (process.env.API_PREFIX || '/api') });
fastify.register(require('./routes/oauth.route'));

fastify.get('/ping', async (request, reply) => { reply.code(200).send('pong') });
fastify.get('/viewer', (req, reply) => { return reply.sendFile('viewer.html'); });
fastify.get("/viewer/*", (req, reply) => {
  return reply.sendFile("viewer.html");
});


// API lấy dung lượng Cloudinary
fastify.get('/cloudinary-usage', async (req, reply) => {
  try {
    const usage = await cloudinary.v2.api.usage();

    const usedMB = +(usage.storage.usage / (1024 ** 2)).toFixed(2);
    let limitMB = usage.storage.limit
      ? +(usage.storage.limit / (1024 ** 2)).toFixed(2)
      : 25600; // 25GB mặc định cho Free plan

    const remainingMB = +(limitMB - usedMB).toFixed(2);

    return reply.send({
      total_used_mb: usedMB,
      total_limit_mb: limitMB,
      remaining_mb: remainingMB,
      plan: usage.plan
    });
  } catch (error) {
    console.error('Error fetching Cloudinary usage:', error);
    return reply.status(500).send({
      message: 'Failed to fetch Cloudinary usage',
      error: error.message || error
    });
  }
});


(async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 8000, host: '0.0.0.0' });
    await initializeData();

    console.log(`\n- 🌟 App running at:`);
    console.log(`- 🚀 Server listening on\x1b[0m \x1b[33mhttp://localhost:${process.env.PORT || 8000}\x1b[0m`);

    fastify.io.on("connection", (socket) => {
      console.log("A client connected:", socket.id);
      socket.on("notify", (data) => { console.log("Đã nhận thông báo từ client:", data); });
      socket.on("disconnect", () => { console.log("Client disconnected:", socket.id); });
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
