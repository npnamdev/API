const corsOptions = {
    origin: ['http://localhost:3000',"https://frame.wedly.info", 'https://test-cookie-iota.vercel.app',"https://crispy-space-invention-7qrjgv4gxv5hrqvg-3000.app.github.dev", "https://app.wedly.info", "https://wedly.info", "https://glorious-meme-9vqgp74p6jv3p74r-3000.app.github.dev", "https://frontify-gray.vercel.app", "https://quizify.wedly.info", "*", "https://scaling-space-journey-pvg5xjqx99j25vx-3000.app.github.dev"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;