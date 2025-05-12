const corsOptions = {
    origin: ['http://localhost:3000', "https://wedly.info", "https://quizify.wedly.info", "https://scaling-space-journey-pvg5xjqx99j25vx-3000.app.github.dev"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;