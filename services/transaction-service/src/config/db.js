const mongoose = require("mongoose");

const env = require("./env");
const logger = require("../utils/logger");

const {
    readiness,
} = require("./readiness");


const connectMongoDB = async () => {
    try {
        await mongoose.connect(
            env.mongoUri
        );

        readiness.mongodb = true;

        logger.info(
            "MongoDB connected successfully"
        );

    } catch (error) {

        readiness.mongodb = false;

        logger.error(
            {
                error: error.message,
            },
            "MongoDB connection failed"
        );

        throw error;
    }
};


mongoose.connection.on(
    "connected",
    () => {
        readiness.mongodb = true;

        logger.info(
            "MongoDB connection established"
        );
    }
);


mongoose.connection.on(
    "disconnected",
    () => {
        readiness.mongodb = false;

        logger.warn(
            "MongoDB connection lost"
        );
    }
);


mongoose.connection.on(
    "error",
    (error) => {
        readiness.mongodb = false;

        logger.error(
            {
                error: error.message,
            },
            "MongoDB connection error"
        );
    }
);


const disconnectMongoDB = async () => {
    try {

        readiness.mongodb = false;

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