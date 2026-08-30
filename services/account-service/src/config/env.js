require("dotenv").config();

const env = {
    nodeEnv:
        process.env.NODE_ENV ||
        "development",

    port:
        Number(process.env.PORT) ||
        3002,

    mongoUri:
        process.env.MONGO_URI,

    jwtSecret:
        process.env.JWT_ACCESS_SECRET,

    internalApiKey:
        process.env.INTERNAL_API_KEY,
};


if (!env.mongoUri) {
    throw new Error(
        "MONGO_URI is required"
    );
}


if (!env.jwtSecret) {
    throw new Error(
        "JWT_ACCESS_SECRET is required"
    );
}


if (!env.internalApiKey) {
    throw new Error(
        "INTERNAL_API_KEY is required"
    );
}


module.exports = env;