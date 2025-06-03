// // routes/dropbox.route.js
// const { Dropbox } = require("dropbox");
// const fetch = require("node-fetch");

// // Cấu hình từ .env
// const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
// const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
// const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || 'http://localhost:3000/dropbox/callback';
// const FRONTEND_SUCCESS_URL = process.env.FRONTEND_SUCCESS_URL || 'http://localhost:5173/dropbox/success';

// async function dropboxRoutes(fastify, opts) {
//     // ===== Dropbox OAuth Flow =====
//     fastify.get('/dropbox/login', async (req, reply) => {
//         const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
//         const authUrl = await dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'code');
//         reply.redirect(authUrl);
//     });

//     fastify.get('/dropbox/callback', async (req, reply) => {
//         const { code } = req.query;
//         const dbx = new Dropbox({
//             clientId: DROPBOX_CLIENT_ID,
//             clientSecret: DROPBOX_CLIENT_SECRET,
//             fetch,
//         });

//         try {
//             console.log("Xin chào");

//             const tokenRes = await dbx.auth.getAccessTokenFromCode(REDIRECT_URI, code);
//             const accessToken = tokenRes.result.access_token;
//             const dbxClient = new Dropbox({ accessToken, fetch });
//             const accountInfo = await dbxClient.usersGetCurrentAccount();
//             // Có thể lưu accessToken vào DB nếu cần thiết
//             // Redirect về frontend + gửi account info (có thể dùng cookie, query, localStorage tùy nhu cầu)
//             // reply.redirect(`${FRONTEND_SUCCESS_URL}?email=${accountInfo.result.email}`);

//             console.log("đã gọi vào đây", accessToken);

//             reply
//                 .setCookie('dropbox_token', accessToken, {
//                     httpOnly: true,
//                     secure: true,
//                     sameSite: 'None',
//                     path: '/',
//                     domain: '.wedly.info',
//                 })
//                 .redirect(`${FRONTEND_SUCCESS_URL}?email=${accountInfo.result.email}`);
//         } catch (err) {
//             console.error('Dropbox auth failed:', err);
//             reply.status(500).send({ error: 'Dropbox authentication failed' });
//         }
//     });

//     fastify.get("/dropbox/files", async (req, reply) => {
//         const token = req.cookies.dropbox_token;
//         if (!token) return reply.status(401).send({ error: "Unauthorized" });

//         const dbx = new Dropbox({ accessToken: token, fetch });

//         try {
//             const listRes = await dbx.filesListFolder({ path: "" });

//             const filesWithPreview = await Promise.all(
//                 listRes.result.entries.map(async (file) => {
//                     let previewUrl = null;
//                     // Chỉ lấy link tạm thời nếu là file ảnh
//                     if (file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
//                         try {
//                             const tempLinkRes = await dbx.filesGetTemporaryLink({ path: file.path_lower });
//                             previewUrl = tempLinkRes.result.link;
//                         } catch (e) {
//                             console.error("Không lấy được link preview:", e);
//                         }
//                     }

//                     return {
//                         id: file.id,
//                         name: file.name,
//                         path_lower: file.path_lower,
//                         size: file.size,
//                         client_modified: file.client_modified,
//                         previewUrl,
//                     };
//                 })
//             );

//             reply.send(filesWithPreview);
//         } catch (err) {
//             console.error(err);
//             reply.status(500).send({ error: "Failed to fetch files" });
//         }
//     });
// }

// module.exports = dropboxRoutes;





// routes/dropbox.route.js
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

const DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
const REDIRECT_URI = process.env.DROPBOX_REDIRECT_URI || 'https://api.wedly.info/api/dropbox/callback';

async function dropboxRoutes(fastify, opts) {
    fastify.get('/dropbox/login', async (req, reply) => {
        const dbx = new Dropbox({ clientId: DROPBOX_CLIENT_ID, fetch });
        const authUrl = await dbx.auth.getAuthenticationUrl(REDIRECT_URI, null, 'code');
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

            // Trả về popup HTML chứa postMessage gửi thông tin về cửa sổ chính
            reply.type('text/html').send(`
        <script>
          window.opener.postMessage({
            type: 'DROPBOX_AUTH_SUCCESS',
            email: '${accountInfo.result.email}'
          }, 'https://api.wedly.info');
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
