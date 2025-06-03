// routes/dropbox.route.js
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI;

async function dropboxRoutes(fastify, opts) {
    fastify.get('/dropbox/login', async (req, reply) => {
        const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
        // const authUrl = await dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'code');
        const authUrl = await dbx.auth.getAuthenticationUrl(
            REDIRECT_URI,
            null,
            'code',
            'offline',
            null,
            'none',
            false
        );

        reply.redirect(authUrl);
    });

    fastify.get('/dropbox/callback', async (req, reply) => {
        const { code } = req.query;
        const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, clientSecret: DROPBOX_CLIENT_SECRET, fetch });

        try {
            const tokenRes = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
            const accessToken = tokenRes.result.access_token;
            const refreshToken = tokenRes.result.refresh_token;
            const dbxClient = new Dropbox({ accessToken, fetch });
            const accountInfo = await dbxClient.usersGetCurrentAccount();

            console.log("check refreshToken", refreshToken);
            reply
                .setCookie('dropbox_refresh_token', refreshToken, {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    domain: '.wedly.info',
                    maxAge: 60 * 60 * 24 * 30 // 30 ngày
                })
                .type('text/html')
                .send(`
                    <script>
                        try {
                            if (window.opener && typeof window.opener.postMessage === 'function') {
                                window.opener.postMessage({
                                    type: 'DROPBOX_AUTH_SUCCESS',
                                    email: "${accountInfo.result.email}",
                                    accessToken: "${accessToken}",
                                }, 'https://wedly.info');

                                console.log('Đã gửi message về cửa sổ cha thành công');
                            } else {
                                console.warn('Không tìm thấy hoặc không thể gửi message về cửa sổ cha');
                            }
                        } catch (error) {
                            console.error('Lỗi khi gửi message:', error);
                        }
                        window.close();
                    </script>
            `);
        } catch (err) {
            console.error('Dropbox auth failed:', err);
            reply.status(500).send({ error: 'Dropbox authentication failed' });
        }
    });

    fastify.get("/dropbox/files", async (req, reply) => {
        const token = req.cookies.dropbox_token;
        if (!token) return reply.status(401).send({ error: "Unauthorized" });
        const dbx = new Dropbox({ accessToken: token, fetch });

        try {
            const listRes = await dbx.filesListFolder({ path: "" });

            const filesWithPreview = await Promise.all(
                listRes.result.entries.map(async (file) => {
                    let previewUrl = null;

                    if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        try {
                            const tempLinkRes = await dbx.filesGetTemporaryLink({ path: file.path_lower });
                            previewUrl = tempLinkRes.result.link;
                        } catch (e) {
                            console.error("Không lấy được link preview:", e);
                        }
                    }

                    return {
                        id: file.id,
                        name: file.name,
                        path_lower: file.path_lower,
                        size: file.size,
                        client_modified: file.client_modified,
                        previewUrl,
                    };
                })
            );

            reply.send(filesWithPreview);
        } catch (err) {
            console.error(err);
            reply.status(500).send({ error: "Failed to fetch files" });
        }
    });
}

module.exports = dropboxRoutes;
