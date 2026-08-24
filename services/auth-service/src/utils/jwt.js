const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
        },
        env.jwtAccessSecret,
        {
            expiresIn: env.jwtAccessExpiresIn,
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.jwtAccessSecret
    );
};

module.exports = {
    generateAccessToken,
    verifyAccessToken,
};