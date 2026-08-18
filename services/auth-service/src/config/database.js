const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error(
            { error: error.message },
            "MongoDB connection failed"
        );

        throw error;
    }
};

module.exports = connectDB;