const {
    verifyAccessToken,
} = require("../utils/jwt");

const authenticate = (req, res, next) => {
    try {
        const authorization =
            req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required",
            });
        }

        const [scheme, token] =
            authorization.split(" ");

        if (
            scheme !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                status: "error",
                message: "Invalid authorization header",
            });
        }

        const decoded =
            verifyAccessToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token",
        });
    }
};

module.exports = authenticate;