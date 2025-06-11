const User = require('../models/user.model');
const Role = require('../models/role.model');

module.exports = async function (fastify, opts) {
  fastify.get('/login/google/callback', async (req, reply) => {
    try {
      const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
      if (!token?.access_token) throw new Error('No access token');

      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!response.ok) throw new Error('User info fetch failed');

      const userInfo = await response.json();

      let user = await User.findOne({ email: userInfo.email }).populate('role');

      if (!user) {
        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
          return reply.code(500).send({ message: 'Default role not found' });
        }

        user = new User({
          username: userInfo.email.split('@')[0],
          email: userInfo.email,
          password: Math.random().toString(36).slice(-8),
          fullName: userInfo.name,
          role: userRole._id,
          isVerified: true,
          avatarUrl: userInfo.picture
        });

        await user.save();

        // Populate sau khi save
        user = await User.findById(user._id).populate('role');
      }

      const accessToken = await reply.jwtSign(
        { id: user._id },
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
      );

      const refreshToken = await reply.jwtSign(
        { id: user._id },
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      );

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        domain: '.wedly.info',
        maxAge: 7 * 24 * 60 * 60
      });


      const targetOrigin = process.env.FRONTEND_URL || 'https://wedly.info';
      return reply
        .type('text/html')
        .send(`
          <script>
            if (window.opener) {
              const accessToken = ${JSON.stringify(accessToken)};
              const userInfo = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(user))}"));

              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                accessToken,
                userInfo
              }, "${targetOrigin}");
              
              window.close();
            } else {
              window.close();
            }
          </script>
      `);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      reply.status(500).send({ error: 'Authentication failed' });
    }
  });

  fastify.get('/login/github/callback', async (req, reply) => {
    try {
      const { token } = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
      if (!token?.access_token) throw new Error('No access token');

      // Lấy thông tin user từ GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!response.ok) throw new Error('User info fetch failed');

      const githubUser = await response.json();

      // Lấy thêm email nếu không có trong response chính
      let email = githubUser.email;
      if (!email) {
        const emailRes = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        if (emailRes.ok) {
          const emails = await emailRes.json();
          const primaryEmail = emails.find(e => e.primary && e.verified);
          email = primaryEmail?.email || emails[0]?.email;
        }
      }

      if (!email) throw new Error('Email not found');

      let user = await User.findOne({ email }).populate('role');

      if (!user) {
        const userRole = await Role.findOne({ name: 'user' });
        if (!userRole) {
          return reply.code(500).send({ message: 'Default role not found' });
        }

        user = new User({
          username: githubUser.login,
          email,
          password: Math.random().toString(36).slice(-8),
          fullName: githubUser.name || githubUser.login,
          role: userRole._id,
          isVerified: true,
          avatarUrl: githubUser.avatar_url
        });

        await user.save();
        user = await User.findById(user._id).populate('role');
      }

      const accessToken = await reply.jwtSign(
        { id: user._id },
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
      );

      const refreshToken = await reply.jwtSign(
        { id: user._id },
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
      );

      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        path: '/',
        domain: '.wedly.info',
        maxAge: 7 * 24 * 60 * 60
      });

      const targetOrigin = process.env.FRONTEND_URL || 'https://wedly.info';
      return reply
        .type('text/html')
        .send(`
          <script>
            if (window.opener) {
              const accessToken = ${JSON.stringify(accessToken)};
              const userInfo = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(user))}"));

              window.opener.postMessage({
                type: 'GITHUB_AUTH_SUCCESS',
                accessToken,
                userInfo
              }, "${targetOrigin}");
              
              window.close();
            } else {
              window.close();
            }
          </script>
      `);
    } catch (err) {
      console.error('GitHub OAuth Error:', err);
      reply.status(500).send({ error: 'Authentication failed' });
    }
  })

  // fastify.get('/login/github/callback', async (req, reply) => {
  //   try {
  //     const { token } = await fastify.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
  //     if (!token?.access_token) throw new Error('Failed to retrieve GitHub access token');

  //     // Gọi API user info từ GitHub
  //     const userInfoResponse = await fetch('https://api.github.com/user', {
  //       headers: {
  //         Authorization: `Bearer ${token.access_token}`,
  //         'User-Agent': 'Fastify-App'
  //       },
  //     });

  //     const userInfo = await userInfoResponse.json();

  //     if (!userInfo || !userInfo.id) throw new Error('Failed to fetch user info');

  //     console.log('GitHub user info:', userInfo);

  //     const targetOrigin = process.env.FRONTEND_URL || 'https://wedly.info';

  //     return reply
  //       .type('text/html')
  //       .send(`
  //       <script>
  //         try {
  //           if (window.opener && typeof window.opener.postMessage === 'function') {
  //             window.opener.postMessage({
  //               type: 'GITHUB_AUTH_SUCCESS',

  //             }, "${targetOrigin}");
  //             window.close();
  //           } else {
  //             console.error('No window.opener available');
  //             window.close();
  //           }
  //         } catch (error) {
  //           console.error('Error in postMessage:', error);
  //           window.close();
  //         }
  //       </script>
  //     `);
  //   } catch (err) {
  //     console.error('GitHub OAuth Error:', err.message);
  //     reply.code(500).send({ error: 'GitHub authentication failed' });
  //   }
  // });


  fastify.get('/login/facebook/callback', async function (request, reply) {
    const token = await this.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
    // Lấy thông tin user từ Facebook
    const response = await fastify.httpClient.request({
      method: 'GET',
      url: 'https://graph.facebook.com/me?fields=id,name,email,picture',
      headers: {
        authorization: `Bearer ${token.access_token}`,
      }
    });

    const userInfo = await response.body.json();
    console.log('Facebook user info:', userInfo);

    return reply.send({ user: userInfo });
  });


  // fastify.get('/login/facebook/callback', async (req, reply) => {
  //   const { code } = req.query;

  //   if (!code) return reply.code(400).send({ message: 'Missing code' });

  //   try {
  //     // 1. Exchange code for access token
  //     const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?` +
  //       new URLSearchParams({
  //         client_id: process.env.FACEBOOK_CLIENT_ID,
  //         client_secret: process.env.FACEBOOK_CLIENT_SECRET,
  //         redirect_uri: 'http://localhost:3000/login/facebook/callback',
  //         code,
  //       })
  //     );

  //     const tokenData = await tokenRes.json();
  //     if (!tokenData.access_token) throw new Error('No access token from Facebook');

  //     // 2. Get user info
  //     const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`);
  //     const fbUser = await userRes.json();

  //     // 3. Check if user exists in DB
  //     let user = await User.findOne({ email: fbUser.email }).populate('role');
  //     if (!user) {
  //       const role = await Role.findOne({ name: 'user' });
  //       user = new User({
  //         username: fbUser.email.split('@')[0],
  //         email: fbUser.email,
  //         fullName: fbUser.name,
  //         password: Math.random().toString(36).slice(-8),
  //         isVerified: true,
  //         role: role._id,
  //         avatarUrl: fbUser.picture?.data?.url
  //       });

  //       await user.save();
  //       user = await User.findById(user._id).populate('role');
  //     }

  //     // 4. Create JWT
  //     const accessToken = await reply.jwtSign({ id: user._id }, { expiresIn: '15m' });
  //     const refreshToken = await reply.jwtSign({ id: user._id }, { expiresIn: '7d' });

  //     reply.setCookie('refreshToken', refreshToken, {
  //       httpOnly: true,
  //       secure: true,
  //       sameSite: 'None',
  //       path: '/',
  //       domain: '.yourdomain.com',
  //       maxAge: 7 * 24 * 60 * 60
  //     });

  //     // 5. Return to frontend
  //     const targetOrigin = process.env.FRONTEND_URL || 'https://yourdomain.com';
  //     return reply.type('text/html').send(`
  //       <script>
  //         if (window.opener) {
  //           const accessToken = ${JSON.stringify(accessToken)};
  //           const userInfo = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(user))}"));
  //           window.opener.postMessage({
  //             type: 'FACEBOOK_AUTH_SUCCESS',
  //             accessToken,
  //             userInfo
  //           }, "${targetOrigin}");
  //           window.close();
  //         } else {
  //           window.close();
  //         }
  //       </script>
  //     `);

  //   } catch (err) {
  //     console.error('Facebook OAuth Error:', err);
  //     reply.code(500).send({ error: 'Facebook login failed' });
  //   }
  // });
};
