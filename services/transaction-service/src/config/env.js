require("dotenv").config();

const env = {
    nodeEnv:
        process.env.NODE_ENV || "development",

    port:
        Number(process.env.PORT) || 3003,

    mongoUri:
        process.env.MONGO_URI,

    accountServiceUrl:
        process.env.ACCOUNT_SERVICE_URL,

    internalApiKey:
        process.env.INTERNAL_API_KEY,

    jwtSecret:
        process.env.JWT_ACCESS_SECRET,
};

if (!env.mongoUri) {
    throw new Error(
        "MONGO_URI is required"
    );
}

if (!env.accountServiceUrl) {
    throw new Error(
        "ACCOUNT_SERVICE_URL is required"
    );
}

if (!env.internalApiKey) {
    throw new Error(
        "INTERNAL_API_KEY is required"
    );
}

if (!env.jwtSecret) {
    throw new Error(
        "JWT_ACCESS_SECRET is required"
    );
}

module.exports = env;