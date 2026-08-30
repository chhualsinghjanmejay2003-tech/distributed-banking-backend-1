const app = require("./app");

const env = require(
    "./config/env"
);

const {
    connectMongoDB,
} = require(
    "./config/db"
);

const {
    readiness,
} = require(
    "./config/readiness"
);


const startServer = async () => {
    try {

        await connectMongoDB();

        readiness.mongodb = true;


        app.listen(
            env.port,
            () => {
                console.log(
                    `Account Service running on port ${env.port}`
                );
            }
        );

    } catch (error) {

        readiness.mongodb = false;

        console.error(
            "Failed to start Account Service:",
            error
        );

        process.exit(1);
    }
};


startServer();