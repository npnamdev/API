require('dotenv').config();
require('./config/cloudinary.config')();
const corsOptions = require('./config/cors');
const fastify = require('fastify')({ logger: false });
const initializeData = require('./utils/initialSetup');

fastify.register(require('@fastify/cors'), corsOptions);
fastify.register(require("fastify-socket.io"), { cors: corsOptions });
fastify.register(require("@fastify/static"), { root: require("path").join(__dirname, "public"), prefix: '/' });
fastify.register(require('@fastify/cookie'));
fastify.register(require('@fastify/session'), {
  secret: 'a-secret-with-minimum-length-of-32-characters',
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: '.wedly.info',
  },
  saveUninitialized: false,
});
fastify.register(require('@fastify/oauth2'), {
  name: 'googleOAuth2',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID,
      secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/login/google',
  callbackUri: `https://api.wedly.info/login/google/callback`,
  callbackUriParams: {
    access_type: 'offline',
  },
  pkce: 'S256',
})

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
fastify.register(require('./routes/activation.route'), { prefix: process.env.API_PREFIX || '/api' });

fastify.get('/login/google/callback', async (req, reply) => {
  try {
    const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const userInfo = await userInfoResponse.json();
    console.log('User Info:', userInfo);

    req.session.user = {
      id: userInfo.id,
      name: userInfo.name,
      email: userInfo.email,
    };
    console.log('Session User:', req.session.user);

    await reply.redirect('/');
  } catch (error) {
    console.error('Google OAuth Error:', error);
    reply.code(500).send('Lỗi xác thực Google');
  }
});

fastify.get('/', async (req, reply) => {
  console.log('Session in /:', req.session.user);
  if (req.session.user) {
    return reply.type('text/html').send(`
      <h1>Xin chào ${req.session.user.name}!</h1>
      <p>Email: ${req.session.user.email}</p>
      <a href="/logout">Đăng xuất</a>
    `);
  }
  reply.type('text/html').send('<a href="/login/google">Đăng nhập với Google</a>');
});

fastify.get('/logout', async (req, reply) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Lỗi khi đăng xuất:', err);
      return reply.code(500).send('Lỗi đăng xuất');
    }
    reply.redirect('/');
  });
});



fastify.get('/ping', async (request, reply) => { reply.code(200).send('pong') });
fastify.get('/view', (req, reply) => { return reply.sendFile('view.html'); });


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
