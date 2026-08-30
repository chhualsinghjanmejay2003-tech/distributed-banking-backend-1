const {
    createClient,
} = require("redis");

const env = require("./env");
const logger = require("../utils/logger");

const {
    readiness,
} = require("./readiness");


const redisClient = createClient({
    url: env.redisUrl,
});


redisClient.on(
    "error",
    (error) => {

        readiness.redis = false;

        logger.error(
            { error: error.message },
            "Redis client error"
        );
    }
);


redisClient.on(
    "ready",
    () => {

        readiness.redis = true;

        logger.info(
            "Redis connection ready"
        );
    }
);


redisClient.on(
    "end",
    () => {

        readiness.redis = false;

        logger.warn(
            "Redis connection closed"
        );
    }
);


const connectRedis = async () => {

    try {

        await redisClient.connect();

        readiness.redis = true;

        logger.info(
            "Redis connected successfully"
        );

    } catch (error) {

        readiness.redis = false;

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