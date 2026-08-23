const { createClient } = require("redis");
const env = require("./env");
const logger = require("../utils/logger");

const redisClient = createClient({
    url: env.redisUrl,
});

redisClient.on("error", (error) => {
    logger.error(
        { error: error.message },
        "Redis client error"
    );
});

const connectRedis = async () => {
    try {
        await redisClient.connect();

        logger.info("Redis connected successfully");
    } catch (error) {
        logger.error(
            { error: error.message },
            "Redis connection failed"
        );

        throw error;
    }
};

module.exports = {
    redisClient,
    connectRedis,
};