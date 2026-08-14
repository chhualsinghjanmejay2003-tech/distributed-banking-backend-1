require("dotenv").config();

const env = {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.AUTH_SERVICE_PORT) || 3001,
};

module.exports = env;