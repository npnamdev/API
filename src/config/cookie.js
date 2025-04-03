const fastifyCookie = require('@fastify/cookie');

function cookieConfig(fastify) {
    fastify.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || 'supersecretkey',
        parseOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            domain: 'example.com'
        }
    });

    // Tự động gia hạn cookie
    fastify.addHook('onRequest', async (req, reply) => {
        if (req.cookies.token) {
            reply.setCookie('token', req.cookies.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24  // 1 ngày
            });
        }
    });
}

module.exports = cookieConfig;