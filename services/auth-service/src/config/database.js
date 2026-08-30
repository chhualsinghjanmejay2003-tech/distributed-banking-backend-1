const mongoose = require("mongoose");

const logger = require("../utils/logger");
const env = require("./env");

const {
    readiness,
} = require("./readiness");


const connectDB = async () => {
    try {
        await mongoose.connect(
            env.mongodbUri
        );

        readiness.mongodb = true;

        logger.info(
            "MongoDB connected successfully"
        );

    } catch (error) {

        readiness.mongodb = false;

        logger.error(
            { error: error.message },
            "MongoDB connection failed"
        );

        throw error;
    }
};


// MongoDB lifecycle events

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
            { error: error.message },
            "MongoDB connection error"
        );
    }
);


module.exports = connectDB;