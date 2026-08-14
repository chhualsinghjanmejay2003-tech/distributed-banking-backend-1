const app = require("./app");
const env = require("./config/env");
const connectDB = require("./config/database");

const startServer = async () => {
    try {
        await connectDB();

        app.listen(env.port, () => {
            console.log(
                `${env.nodeEnv} auth-service running on port ${env.port}`
            );
        });
    } catch (error) {
        console.error("Failed to start auth-service");
        process.exit(1);
    }
};

startServer();