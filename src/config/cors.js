const corsOptions = {
    origin: ['http://localhost:3000', "https://wedly.info", "https://quizify.wedly.info", "https://refactored-space-cod-x69gj5qj9qphp6gx.github.dev"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;