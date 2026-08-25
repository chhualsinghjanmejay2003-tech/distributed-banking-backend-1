const jwt = require("jsonwebtoken");
const env = require("../config/env");

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.jwtSecret
    );
};

module.exports = {
    verifyAccessToken,
};