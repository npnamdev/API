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

            const targetOrigin = process.env.FRONTEND_URL || 'https://wedly.info';
            return reply
                .type('text/html')
                .send(`
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                userInfo: ${JSON.stringify(userInfo)}
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
};
