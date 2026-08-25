require("dotenv").config();

const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.PORT) || 3002,

    mongoUri: process.env.MONGO_URI,
};

if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
}

module.exports = env;