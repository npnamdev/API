const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI;

async function dropboxRoutes(fastify, opts) {
    fastify.get('/dropbox/login', async (req, reply) => {
        try {
            const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
            const authUrl = await dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'code', 'offline', null, 'none', false);
            console.log('Redirecting to Dropbox auth URL:', authUrl);
            reply.redirect(authUrl);
        } catch (err) {
            console.error('Error generating Dropbox auth URL:', err);
            reply.status(500).send({ error: 'Failed to initiate Dropbox authentication' });
        }
    });

    fastify.get('/dropbox/callback', async (req, reply) => {
        const { code } = req.query;
        const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, clientSecret: DROPBOX_CLIENT_SECRET, fetch });

        try {
            console.log('Received auth code:', code);
            const tokenRes = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
            const accessToken = tokenRes.result.access_token;
            const refreshToken = tokenRes.result.refresh_token;
            const dbxClient = new Dropbox({ accessToken, fetch });
            const accountInfo = await dbxClient.usersGetCurrentAccount();

            console.log('Dropbox auth successful. Access token:', accessToken, 'Refresh token:', refreshToken);
            reply
                .setCookie('dropbox_refresh_token', refreshToken, {
                    path: '/',
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    domain: '.wedly.info',
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
                                console.log('Sent postMessage to parent window');
                            } else {
                                console.warn('Parent window not found or postMessage not supported');
                            }
                        } catch (error) {
                            console.error('Error sending postMessage:', error);
                        }
                        window.close();
                    </script>
                `);
        } catch (err) {
            console.error('Dropbox auth failed:', err);
            reply.status(500).send({ error: 'Dropbox authentication failed', details: err.message });
        }
    });

    fastify.get("/dropbox/files", async (req, reply) => {
        const authHeader = req.headers.authorization;
        const refreshToken = req.cookies.dropbox_refresh_token;

        console.log('Received request for /dropbox/files. Auth header:', authHeader, 'Refresh token:', refreshToken);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error('No access token provided');
            return reply.status(401).send({ error: "Unauthorized: No access token provided" });
        }

        if (!refreshToken) {
            console.error('No refresh token provided');
            return reply.status(401).send({ error: "Unauthorized: No refresh token provided. Please re-authenticate with Dropbox." });
        }

        const token = authHeader.split(" ")[1];
        const dbx = new Dropbox({
            clientId: DROPBOX_CLIENT_ID,
            clientSecret: DROPBOX_CLIENT_SECRET,
            accessToken: token,
            refreshToken: refreshToken,
            fetch
        });

        try {
            console.log('Checking and refreshing access token...');
            await dbx.auth.checkAndRefreshAccessToken();
            const newAccessToken = dbx.auth.getAccessToken();
            console.log('Access token after refresh:', newAccessToken);

            console.log('Fetching file list from Dropbox...');
            const listRes = await dbx.filesListFolder({ path: "" });
            console.log('Files received:', listRes.result.entries);

            const filesWithPreview = await Promise.all(
                listRes.result.entries.map(async (file) => {
                    let previewUrl = null;

                    if (file['.tag'] === 'file' && file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        try {
                            const tempLinkRes = await dbx.filesGetTemporaryLink({ path: file.path_lower });
                            previewUrl = tempLinkRes.result.link;
                            console.log(`Preview URL for ${file.name}:`, previewUrl);
                        } catch (e) {
                            console.error(`Failed to get preview link for ${file.name}:`, e);
                        }
                    }

                    return {
                        id: file.id,
                        name: file.name,
                        path_lower: file.path_lower,
                        size: file.size || 0,
                        client_modified: file.client_modified || new Date().toISOString(),
                        previewUrl,
                    };
                })
            );

            reply.send({
                files: filesWithPreview,
                newAccessToken: newAccessToken !== token ? newAccessToken : undefined
            });
        } catch (err) {
            console.error('Error fetching files or refreshing token:', err);
            if (err.status === 401) {
                return reply.status(401).send({ error: "Unauthorized: Invalid or expired refresh token. Please re-authenticate with Dropbox.", details: err.message });
            }
            reply.status(500).send({ error: "Failed to fetch files", details: err.message });
        }
    });
}

module.exports = dropboxRoutes;