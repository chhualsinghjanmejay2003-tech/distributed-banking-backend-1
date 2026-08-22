const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

let server;

const startServer = async () => {
    try {
        await connectDB();

        server = app.listen(env.port, () => {
            logger.info(
                `${env.nodeEnv} auth-service running on port ${env.port}`
            );
        });
    } catch (error) {
        logger.error(
            { error: error.message },
            "Failed to start auth-service"
        );

        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    logger.info({ signal }, "Shutdown signal received");

    if (!server) {
        process.exit(0);
    }

    server.close(async () => {
        logger.info("HTTP server closed");

        try {
            await mongoose.connection.close();

            logger.info("MongoDB connection closed");

            process.exit(0);
        } catch (error) {
            logger.error(
                { error: error.message },
                "Error during shutdown"
            );

            process.exit(1);
        }
    });
};

process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
});

startServer();