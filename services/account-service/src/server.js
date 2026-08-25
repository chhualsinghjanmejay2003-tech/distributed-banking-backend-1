const app = require("./app");

const env = require("./config/env");

const {
    connectMongoDB,
} = require("./config/mongodb");

const startServer = async () => {
    try {
        await connectMongoDB();

        app.listen(env.port, () => {
            console.log(
                `${env.nodeEnv} account-service running on port ${env.port}`
            );
        });
    } catch (error) {
        console.error(
            "Failed to start account-service:",
            error.message
        );

        process.exit(1);
    }
};

startServer();