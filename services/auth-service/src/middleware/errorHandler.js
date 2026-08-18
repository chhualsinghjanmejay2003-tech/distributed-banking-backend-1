const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    logger.error(
        {
            error: err.message,
            stack: err.stack,
            method: req.method,
            path: req.originalUrl,
        },
        "Request failed"
    );

    res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error"
                : err.message,
    });
};

module.exports = errorHandler;