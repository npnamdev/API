const corsOptions = {
    origin: ['http://localhost:3000', 'https://test-cookie-iota.vercel.app',"https://crispy-space-invention-7qrjgv4gxv5hrqvg-3000.app.github.dev", "https://app.wedly.info", "https://wedly.info", "https://glorious-meme-9vqgp74p6jv3p74r-3000.app.github.dev", "https://frontify-gray.vercel.app"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;