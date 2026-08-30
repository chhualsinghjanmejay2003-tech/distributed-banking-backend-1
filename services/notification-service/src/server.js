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

const {
    readiness,
} = require("./config/readiness");


const startServer = async () => {
    let connection;

    try {

        /*
         * RabbitMQ
         */
        const rabbitMQ =
            await connectRabbitMQ();

        connection =
            rabbitMQ.connection;

        const channel =
            rabbitMQ.channel;

        readiness.rabbitmq = true;


        /*
         * RabbitMQ consumer
         */
        await startTransactionConsumer(
            channel
        );


        /*
         * Kafka
         */
        await startKafkaConsumer();

        readiness.kafka = true;


        console.log(
            "Notification Service started successfully"
        );


        /*
         * Graceful shutdown
         */
        const shutdown = async (
            signal
        ) => {

            console.log(
                `${signal} received. Shutting down...`
            );

            try {

                /*
                 * Stop Kafka consumer
                 */
                await stopKafkaConsumer();

                readiness.kafka = false;


                /*
                 * Close RabbitMQ
                 */
                if (connection) {
                    await connection.close();
                }

                readiness.rabbitmq = false;


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

        readiness.rabbitmq = false;
        readiness.kafka = false;

        console.error(
            "Failed to start Notification Service:",
            error.message
        );

        process.exit(1);
    }
};


startServer();