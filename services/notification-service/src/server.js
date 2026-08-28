require("dotenv").config();

const {
    connectRabbitMQ,
} = require("./config/rabbitmq");

const {
    startTransactionConsumer,
} = require("./consumers/transaction.consumer");

const {
    startKafkaConsumer,
    stopKafkaConsumer,
} = require(
    "./consumers/transaction.kafka.consumer"
);

const startServer = async () => {
    try {
        const {
            connection,
            channel,
        } = await connectRabbitMQ();

        await startTransactionConsumer(
            channel
        );

        await startKafkaConsumer();

        console.log(
            "Notification Service started successfully"
        );

        const shutdown = async (signal) => {
            console.log(
                `${signal} received. Shutting down...`
            );

            try {

                // Stop Kafka consumer
                await stopKafkaConsumer();
                await connection.close();

                console.log(
                    "Notification Service shut down successfully"
                );

                process.exit(0);
            } catch (error) {
                console.error(
                    "Error during shutdown:",
                    error.message
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
    } catch (error) {
        console.error(
            "Failed to start Notification Service:",
            error.message
        );

        process.exit(1);
    }
};

startServer();