const amqp = require("amqplib");

const env = require("./env");
const logger = require("../utils/logger");

const {
    readiness,
} = require("./readiness");


let connection = null;
let channel = null;


const connectRabbitMQ = async () => {

    try {

        connection = await amqp.connect(
            env.rabbitmqUrl
        );

        channel =
            await connection.createChannel();


        connection.on(
            "error",
            (error) => {

                readiness.rabbitmq = false;

                logger.error(
                    {
                        error: error.message,
                    },
                    "RabbitMQ connection error"
                );
            }
        );


        connection.on(
            "close",
            () => {

                readiness.rabbitmq = false;

                connection = null;
                channel = null;

                logger.warn(
                    "RabbitMQ connection closed"
                );
            }
        );


        readiness.rabbitmq = true;


        logger.info(
            "RabbitMQ connected successfully"
        );

    } catch (error) {

        readiness.rabbitmq = false;

        logger.error(
            { error: error.message },
            "RabbitMQ connection failed"
        );

        throw error;
    }
};


const closeRabbitMQ = async () => {

    readiness.rabbitmq = false;


    if (channel) {

        await channel.close();

        channel = null;
    }


    if (connection) {

        await connection.close();

        connection = null;
    }


    logger.info(
        "RabbitMQ connection closed"
    );
};


module.exports = {
    connectRabbitMQ,
    closeRabbitMQ,
};