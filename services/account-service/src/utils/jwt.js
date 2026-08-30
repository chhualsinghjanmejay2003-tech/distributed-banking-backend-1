const jwt = require("jsonwebtoken");

const env = require(
    "../config/env"
);


const JWT_ALGORITHM = "HS256";


const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        env.jwtSecret,
        {
            algorithms: [
                JWT_ALGORITHM,
            ],
        }
    );
};


module.exports = {
    verifyAccessToken,
};