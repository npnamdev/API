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
  cookie: { secure: true }, 
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
  callbackUri: `${process.env.APP_URL || 'http://localhost:8081'}/login/google/callback`,
  callbackUriParams: {
    access_type: 'offline', // Để lấy refreshToken nếu cần
  },
  pkce: 'S256', // Sử dụng PKCE để tăng cường bảo mật
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

fastify.get('/', async (req, reply) => {
  if (req.session.user) {
    return reply.send(`Xin chào ${req.session.user.name}!`);
  }
  reply.type('text/html').send('<a href="/login/google">Đăng nhập với Google</a>');
});



// // Route xử lý callback từ Google
// fastify.get('/login/google/callback', async (req, reply) => {
//   try {
//     const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

//     // Lấy thông tin người dùng từ Google API
//     const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//       headers: { Authorization: `Bearer ${token.access_token}` },
//     });
//     const userInfo = await userInfoResponse.json();

//     // Lưu thông tin người dùng vào session
//     req.session.user = {
//       id: userInfo.id,
//       name: userInfo.name,
//       email: userInfo.email,
//     };

//     // Chuyển hướng về trang chính hoặc trang mong muốn
//     reply.redirect('/');
//   } catch (error) {
//     console.error('Google OAuth Error:', error);
//     reply.code(500).send('Lỗi xác thực Google');
//   }
// });



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
