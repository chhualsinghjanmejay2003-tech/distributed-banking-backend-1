const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");
const logger = require("./utils/logger");
const mongoose = require("mongoose");

const {
    redisClient,
    connectRedis,
} = require("./config/redis");
let server;

const {
    connectRabbitMQ,
    closeRabbitMQ,
} = require("./config/rabbitmq");

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();
        await connectRabbitMQ();

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

            if (redisClient.isOpen) {
                await redisClient.quit();

                logger.info("Redis connection closed");
            }

            await closeRabbitMQ();

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