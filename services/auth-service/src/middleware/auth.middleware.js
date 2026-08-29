const {
    verifyAccessToken,
} = require("../utils/jwt");

const authenticate = (
    req,
    res,
    next
) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: "error",
                message:
                    "Authorization header is required",
            });
        }

        const [scheme, token] =
            authHeader.split(" ");

        if (
            scheme !== "Bearer" ||
            !token
        ) {
            return res.status(401).json({
                status: "error",
                message:
                    "Invalid authorization format",
            });
        }

        const decoded =
            verifyAccessToken(token);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message:
                "Invalid or expired access token",
        });
    }
};

module.exports = authenticate;