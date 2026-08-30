const mongoose = require("mongoose");

const env = require("./env");

const {
    readiness,
} = require("./readiness");


const connectMongoDB = async () => {
    try {
        await mongoose.connect(
            env.mongoUri
        );

        readiness.mongodb = true;

        console.log(
            "MongoDB connected successfully"
        );

    } catch (error) {

        readiness.mongodb = false;

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};


/*
 * MongoDB connection lifecycle
 */

mongoose.connection.on(
    "connected",
    () => {
        readiness.mongodb = true;

        console.log(
            "MongoDB connection established"
        );
    }
);


mongoose.connection.on(
    "disconnected",
    () => {
        readiness.mongodb = false;

        console.warn(
            "MongoDB connection lost"
        );
    }
);


mongoose.connection.on(
    "error",
    () => {
        readiness.mongodb = false;
    }
);


const disconnectMongoDB = async () => {

    readiness.mongodb = false;

    await mongoose.disconnect();

    console.log(
        "MongoDB disconnected"
    );
};


module.exports = {
    connectMongoDB,
    disconnectMongoDB,
};