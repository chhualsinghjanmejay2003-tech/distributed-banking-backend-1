const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");
const logger = require("./utils/logger");

const startServer = async () => {
    try {
        await connectDB();

        app.listen(env.port, () => {
            logger.info(
                `${env.nodeEnv} auth-service running on port ${env.port}`
            );
        });
    } catch (error) {
        logger.error(
            { error: error.message },
            "Failed to start auth-service"
        );

        process.exit(1);
    }
};

startServer();