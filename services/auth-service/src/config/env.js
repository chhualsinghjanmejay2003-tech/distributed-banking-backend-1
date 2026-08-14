require("dotenv").config();

const env = {
    nodeEnv: process.env.NODE_ENV || "development",

    port: Number(process.env.AUTH_SERVICE_PORT) || 3001,

    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
};

if (!env.jwtAccessSecret) {
    throw new Error("JWT_ACCESS_SECRET is required");
}

if (!env.jwtRefreshSecret) {
    throw new Error("JWT_REFRESH_SECRET is required");
}

module.exports = env;