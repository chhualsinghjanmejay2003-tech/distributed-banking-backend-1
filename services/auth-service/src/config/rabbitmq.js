const amqp = require("amqplib");
const env = require("./env");
const logger = require("../utils/logger");

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(env.rabbitmqUrl);

        channel = await connection.createChannel();

        logger.info("RabbitMQ connected successfully");
    } catch (error) {
        logger.error(
            { error: error.message },
            "RabbitMQ connection failed"
        );

        throw error;
    }
};

const closeRabbitMQ = async () => {
    if (channel) {
        await channel.close();
        channel = null;
    }

    if (connection) {
        await connection.close();
        connection = null;
    }

    logger.info("RabbitMQ connection closed");
};

module.exports = {
    connectRabbitMQ,
    closeRabbitMQ,
};