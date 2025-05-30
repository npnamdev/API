// routes/dropbox.route.js
const { Dropbox } = require("dropbox");
const fetch = require("node-fetch");

async function dropboxRoutes(fastify, opts) {
    fastify.get("/dropbox/files", async (req, reply) => {
        const token = req.cookies.dropbox_token;
        if (!token) return reply.status(401).send({ error: "Unauthorized" });

        const dbx = new Dropbox({ accessToken: token, fetch });

        try {
            const result = await dbx.filesListFolder({ path: "" }); // root folder
            reply.send(result.result.entries);
        } catch (err) {
            console.error(err);
            reply.status(500).send({ error: "Failed to fetch files" });
        }
    });
}

module.exports = dropboxRoutes;
