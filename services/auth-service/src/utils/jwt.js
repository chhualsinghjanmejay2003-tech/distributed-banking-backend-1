const jwt = require("jsonwebtoken");
const env = require("../config/env");

const JWT_ALGORITHM = "HS256";

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role,
        },
        env.jwtAccessSecret,
        {
            expiresIn:
                env.jwtAccessExpiresIn,
            algorithm: JWT_ALGORITHM,
        }
    );
};

const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.jwtAccessSecret,
        {
            algorithms: [JWT_ALGORITHM],
        }
    );
};

module.exports = {
    generateAccessToken,
    verifyAccessToken,
};