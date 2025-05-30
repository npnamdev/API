// routes/dropbox.route.js
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

async function dropboxRoutes(fastify, opts) {
    fastify.get("/dropbox/files", async (req, reply) => {
        const token = req.cookies.dropbox_token;
        if (!token) return reply.status(401).send({ error: "Unauthorized" });

        const dbx = new Dropbox({ accessToken: token, fetch });

        try {
            const listRes = await dbx.filesListFolder({ path: "" });

            const filesWithPreview = await Promise.all(
                listRes.result.entries.map(async (file) => {
                    let previewUrl = null;

                    // Chỉ lấy link tạm thời nếu là file ảnh
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
