const corsOptions = {
    origin: [
        'http://localhost:3000',
        "https://wedly.info",
        "https://didactic-funicular-x55q7vw6q56c997q-3000.app.github.dev",
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;
