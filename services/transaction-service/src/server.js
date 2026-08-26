const app = require("./app");

const env = require("./config/env");

const {
    connectMongoDB,
} = require("./config/db");

const startServer = async () => {
    try {
        await connectMongoDB();

        app.listen(env.port, () => {
            console.log(
                `Transaction Service running on port ${env.port}`
            );
        });
    } catch (error) {
        console.error(
            "Failed to start Transaction Service:",
            error
        );

        process.exit(1);
    }
};

startServer();