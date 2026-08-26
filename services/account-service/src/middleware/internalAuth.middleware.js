const env = require("../config/env");

const internalAuth = (req, res, next) => {
    const apiKey = req.headers["x-internal-api-key"];

    if (!apiKey || apiKey !== env.internalApiKey) {
        return res.status(401).json({
            status: "error",
            message: "Unauthorized",
        });
    }

    next();
};

module.exports = internalAuth;