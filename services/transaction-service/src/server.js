require("dotenv").config();

const app = require("./app");
const env = require("./config/env");

const {
    connectMongoDB,
    disconnectMongoDB,
} = require("./config/db");

const {
    connectRabbitMQ,
    closeRabbitMQ,
} = require("./config/rabbitmq");

const {
    connectKafka,
    disconnectKafka,
} = require("./config/kafka");

const {
    readiness,
} = require("./config/readiness");


let server;


const startServer = async () => {
    try {

        // Connect to MongoDB
        await connectMongoDB();

        readiness.mongodb = true;


        // Connect to RabbitMQ
        await connectRabbitMQ();

        readiness.rabbitmq = true;


        // Connect to Kafka
        await connectKafka();

        readiness.kafka = true;


        // Start HTTP server
        server = app.listen(
            env.port,
            () => {
                console.log(
                    `Transaction Service running on port ${env.port}`
                );
            }
        );

    } catch (error) {

        console.error(
            "Failed to start Transaction Service:",
            error
        );

        process.exit(1);
    }
};


const shutdown = async (signal) => {

    console.log(
        `${signal} received. Shutting down...`
    );

    try {

        // Stop accepting new HTTP requests
        if (server) {
            await new Promise(
                (resolve, reject) => {
                    server.close((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                }
            );
        }


        // Close RabbitMQ
        await closeRabbitMQ();

        readiness.rabbitmq = false;


        // Close Kafka
        await disconnectKafka();

        readiness.kafka = false;


        // Close MongoDB
        await disconnectMongoDB();

        readiness.mongodb = false;


        console.log(
            "Transaction Service shut down successfully"
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "Error during shutdown:",
            error
        );

        process.exit(1);
    }
};


process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);


startServer();