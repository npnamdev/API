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

      let user = await User.findOne({ email: userInfo.email });

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

      console.log("check userInffo google: ", userInfo);
      console.log("check login callback: ", user);


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

      // return reply
      //   .type('text/html')
      //   .send(`
      //     <script>
      //       if (window.opener) {
      //         window.opener.postMessage({
      //           type: 'GOOGLE_AUTH_SUCCESS',
      //           accessToken: ${JSON.stringify(accessToken)},
      //           userInfo: ${JSON.stringify(user)}
      //         }, "${targetOrigin}");
      //         window.close();
      //       } else {
      //         window.close();
      //       }
      //     </script>
      //   `);
    } catch (err) {
      console.error('Google OAuth Error:', err);
      reply.status(500).send({ error: 'Authentication failed' });
    }
  });
};
