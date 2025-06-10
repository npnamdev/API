const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI;

async function dropboxRoutes(fastify, opts) {
    fastify.get('/dropbox/login', async (req, reply) => {
        const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
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
        const dbx = new Dropbox({
            clientId: DROPBOX_CLIENT_ID,
            clientSecret: DROPBOX_CLIENT_SECRET,
            fetch
        });

        try {
            const tokenRes = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
            const accessToken = tokenRes.result.access_token;
            const refreshToken = tokenRes.result.refresh_token;
            const dbxClient = new Dropbox({ accessToken, fetch });
            const accountInfo = await dbxClient.usersGetCurrentAccount();

            reply
                .setCookie('dropbox_refresh_token', refreshToken, {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    domain: '.wedly.info',
                    maxAge: 60 * 60 * 24 * 30,
                })
                .type('text/html')
                .send(`
                    <script>
                        try {
                            if (window.opener && typeof window.opener.postMessage === 'function') {
                                window.opener.postMessage({
                                    type: 'DROPBOX_AUTH_SUCCESS',
                                    email: "${accountInfo.result.email}",
                                    accessToken: "${accessToken}"
                                }, 'https://wedly.info');
                            }
                            window.close();
                        } catch (error) {
                            console.error('Error:', error);
                            window.close();
                        }
                    </script>
                `);
        } catch (err) {
            console.error('Dropbox auth failed:', err);
            reply.status(500).send({ error: 'Dropbox authentication failed' });
        }
    });

    fastify.post('/dropbox/refresh-token', async (req, reply) => {
        const refreshToken = req.cookies?.dropbox_refresh_token;

        if (!refreshToken) {
            return reply.status(401).send({ error: 'No refresh token provided' });
        }

        const dbx = new Dropbox({
            clientId: DROPBOX_CLIENT_ID,
            clientSecret: DROPBOX_CLIENT_SECRET,
            fetch
        });

        try {
            dbx.auth.setRefreshToken(refreshToken);
            await dbx.auth.refreshAccessToken();
            const accessToken = dbx.auth.getAccessToken();

            return reply.send({ accessToken });
        } catch (error) {
            console.error('Refresh token failed:', error);
            return reply.status(401).send({ error: 'Failed to refresh token. Please login again.' });
        }
    });

    fastify.get("/dropbox/files", async (req, reply) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ error: "Unauthorized: No token provided" });
        }

        const accessToken = authHeader.split(" ")[1];
        const dbx = new Dropbox({ accessToken, fetch });

        const { cursor, limit } = req.query;
        const parsedLimit = parseInt(limit) || 20;

        try {
            const listRes = cursor
                ? await dbx.filesListFolderContinue({ cursor })
                : await dbx.filesListFolder({ path: "", limit: parsedLimit });

            const entries = listRes.result.entries;

            const filesWithPreview = await Promise.all(
                entries.map(async (file) => {
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

            return reply.send({
                data: filesWithPreview,
                cursor: listRes.result.cursor,
                has_more: listRes.result.has_more,
            });
        } catch (err) {
            console.error("Dropbox API error:", err);
            return reply.status(500).send({ error: "Failed to fetch files from Dropbox" });
        }
    });


    // fastify.get("/dropbox/files", async (req, reply) => {
    //     const authHeader = req.headers.authorization;

    //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //         return reply.status(401).send({ error: "Unauthorized: No token provided" });
    //     }

    //     const accessToken = authHeader.split(" ")[1];
    //     const dbx = new Dropbox({ accessToken, fetch });

    //     try {
    //         const listRes = await dbx.filesListFolder({ path: "" });

    //         const filesWithPreview = await Promise.all(
    //             listRes.result.entries.map(async (file) => {
    //                 let previewUrl = null;

    //                 if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    //                     try {
    //                         const tempLinkRes = await dbx.filesGetTemporaryLink({ path: file.path_lower });
    //                         previewUrl = tempLinkRes.result.link;
    //                     } catch (e) {
    //                         console.error("Không lấy được link preview:", e);
    //                     }
    //                 }

    //                 return {
    //                     id: file.id,
    //                     name: file.name,
    //                     path_lower: file.path_lower,
    //                     size: file.size,
    //                     client_modified: file.client_modified,
    //                     previewUrl,
    //                 };
    //             })
    //         );

    //         return reply.send(filesWithPreview);
    //     } catch (err) {
    //         console.error("Dropbox API error:", err);
    //         return reply.status(500).send({ error: "Failed to fetch files from Dropbox" });
    //     }
    // });


}

module.exports = dropboxRoutes;
