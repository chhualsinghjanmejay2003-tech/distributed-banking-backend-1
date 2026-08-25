const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectMongoDB = async () => {
    try {
        await mongoose.connect(env.mongoUri);

        logger.info(
            "MongoDB connected successfully"
        );
    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "MongoDB connection failed"
        );

        throw error;
    }
};

const disconnectMongoDB = async () => {
    try {
        await mongoose.disconnect();

        logger.info(
            "MongoDB disconnected successfully"
        );
    } catch (error) {
        logger.error(
            {
                error: error.message,
            },
            "MongoDB disconnection failed"
        );

        throw error;
    }
};

module.exports = {
    connectMongoDB,
    disconnectMongoDB,
};