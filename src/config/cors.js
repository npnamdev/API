const corsOptions = {
    origin: ['http://localhost:5173', 'https://test-cookie-iota.vercel.app', "https://app.wedly.info", "https://wedly.info"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;