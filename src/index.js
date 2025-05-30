require('dotenv').config();
require('./config/cloudinary.config')();
const corsOptions = require('./config/cors');
const fastify = require('fastify')({ logger: false });
const initializeData = require('./utils/initialSetup');

const { Dropbox } = require('dropbox');
const fetch = require('node-fetch'); // cần cho Dropbox SDK

// Cấu hình từ .env
const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3000/dropbox/callback';
const FRONTEND_SUCCESS_URL = process.env.FRONTEND_SUCCESS_URL || 'http://localhost:5173/dropbox/success';

fastify.register(require('@fastify/cors'), corsOptions);
fastify.register(require("fastify-socket.io"), { cors: corsOptions });
fastify.register(require("@fastify/static"), { root: require("path").join(__dirname, "public"), prefix: '/' });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
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
fastify.register(require('./routes/chapter.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/userGroup.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/contact.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/order.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/section.route'), { prefix: process.env.API_PREFIX || '/api' });
fastify.register(require('./routes/dropbox.route'), { prefix: process.env.API_PREFIX || '/api' });


fastify.get('/ping', async (request, reply) => { reply.code(200).send('pong') });
fastify.get("/", (req, reply) => { return reply.sendFile("index.html") });
fastify.get('/view', (req, reply) => { return reply.sendFile('view.html'); });

// ===== Dropbox OAuth Flow =====
fastify.get('/dropbox/login', async (req, reply) => {
  const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
  const authUrl = await dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'code'); // Thêm 'code' để dùng authorization code flow
  reply.redirect(authUrl);
});

fastify.get('/dropbox/callback', async (req, reply) => {
  const { code } = req.query;
  const dbx = new Dropbox({
    clientId: DROPBOX_CLIENT_ID,
    clientSecret: DROPBOX_CLIENT_SECRET,
    fetch,
  });

  try {
    const tokenRes = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
    const accessToken = tokenRes.result.access_token;
    const dbxClient = new Dropbox({ accessToken, fetch });
    const accountInfo = await dbxClient.usersGetCurrentAccount();
    // Có thể lưu accessToken vào DB nếu cần thiết
    // Redirect về frontend + gửi account info (có thể dùng cookie, query, localStorage tùy nhu cầu)
    // reply.redirect(`${FRONTEND_SUCCESS_URL}?email=${accountInfo.result.email}`);
    reply
      .setCookie('dropbox_token', accessToken, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
      })
      .redirect(`${FRONTEND_SUCCESS_URL}?email=${accountInfo.result.email}`);
  } catch (err) {
    console.error('Dropbox auth failed:', err);
    reply.status(500).send({ error: 'Dropbox authentication failed' });
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
})()
