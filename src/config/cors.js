const corsOptions = {
    origin: [
        'http://localhost:3000', 
        "https://wedly.info", 
        "https://refactored-space-cod-x69gj5qj9qphp6gx-3000.app.github.dev",
        "https://psychic-space-giggle-5g95w4664rvj279jq-3000.app.github.dev"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

module.exports = corsOptions;
