require("dotenv").config();

const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.AUTH_SERVICE_PORT) || 3001,

    mongodbUri: process.env.MONGODB_URI,

    redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

    rabbitmqUrl: process.env.RABBITMQ_URL || "amqp://localhost:5672",
    
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

    logLevel: process.env.LOG_LEVEL || "info",
};

if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is required");
}

if (!env.jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is required");
}

if (!env.jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is required");
}

module.exports = env;