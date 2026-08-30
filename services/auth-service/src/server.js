const app = require("./app");

const env = require(
    "./config/env"
);

const connectDB = require(
    "./config/database"
);

const logger = require(
    "./utils/logger"
);

const mongoose = require(
    "mongoose"
);


const {
    redisClient,
    connectRedis,
} = require(
    "./config/redis"
);


const {
    connectRabbitMQ,
    closeRabbitMQ,
} = require(
    "./config/rabbitmq"
);


const {
    connectKafka,
    disconnectKafka,
} = require(
    "./config/kafka"
);


const {
    readiness,
} = require(
    "./config/readiness"
);


let server;


/*
 * Start server
 */
const startServer = async () => {
    try {
        /*
         * MongoDB
         */
        await connectDB();

        readiness.mongodb = true;


        /*
         * Redis
         */
        await connectRedis();

        readiness.redis = true;


        /*
         * RabbitMQ
         */
        await connectRabbitMQ();

        readiness.rabbitmq = true;


        /*
         * Kafka
         */
        await connectKafka();

        readiness.kafka = true;


        /*
         * All dependencies are ready.
         * Only now do we start accepting
         * HTTP traffic.
         */
        server = app.listen(
            env.port,
            () => {
                logger.info(
                    `${env.nodeEnv} auth-service running on port ${env.port}`
                );
            }
        );

    } catch (error) {

        logger.error(
            {
                error: error.message,
            },
            "Failed to start auth-service"
        );

        process.exit(1);
    }
};


/*
 * Graceful shutdown
 */
const gracefulShutdown = async (
    signal
) => {

    logger.info(
        {
            signal,
        },
        "Shutdown signal received"
    );


    if (!server) {
        process.exit(0);
    }


    server.close(
        async () => {

            logger.info(
                "HTTP server closed"
            );


            try {

                /*
                 * MongoDB
                 */
                await mongoose.connection.close();

                readiness.mongodb = false;

                logger.info(
                    "MongoDB connection closed"
                );


                /*
                 * Redis
                 */
                if (redisClient.isOpen) {

                    await redisClient.quit();

                    readiness.redis = false;

                    logger.info(
                        "Redis connection closed"
                    );
                }


                /*
                 * RabbitMQ
                 */
                await closeRabbitMQ();

                readiness.rabbitmq = false;


                /*
                 * Kafka
                 */
                await disconnectKafka();

                readiness.kafka = false;


                process.exit(0);

            } catch (error) {

                logger.error(
                    {
                        error: error.message,
                    },
                    "Error during shutdown"
                );

                process.exit(1);
            }
        }
    );
};


/*
 * Process termination signals
 */
process.on(
    "SIGINT",
    () => {
        gracefulShutdown(
            "SIGINT"
        );
    }
);


process.on(
    "SIGTERM",
    () => {
        gracefulShutdown(
            "SIGTERM"
        );
    }
);


/*
 * Start application
 */
startServer();