const mongoose = require("mongoose");
const env = require("./env");

const connectMongoDB = async () => {
    try {
        await mongoose.connect(env.mongoUri);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

const disconnectMongoDB = async () => {
    await mongoose.disconnect();

    console.log("MongoDB disconnected");
};

module.exports = {
    connectMongoDB,
    disconnectMongoDB,
};