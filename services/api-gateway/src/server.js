const app = require("./app");
const env = require("./config/env");

const server = app.listen(
    env.port,
    () => {
        console.log(
            `API Gateway running on port ${env.port}`
        );
    }
);

const shutdown = (signal) => {
    console.log(
        `${signal} received. Shutting down...`
    );

    server.close(() => {
        console.log(
            "API Gateway shut down successfully"
        );

        process.exit(0);
    });
};

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);