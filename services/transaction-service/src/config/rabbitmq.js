const amqp = require("amqplib");

const env = require("./env");

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(
            env.rabbitmqUrl
        );

        channel = await connection.createChannel();

        console.log(
            "RabbitMQ connected successfully"
        );

        return channel;
    } catch (error) {
        console.error(
            "RabbitMQ connection failed:",
            error.message
        );

        throw error;
    }
};

const getChannel = () => {
    if (!channel) {
        throw new Error(
            "RabbitMQ channel is not initialized"
        );
    }

    return channel;
};

const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }

        if (connection) {
            await connection.close();
            connection = null;
        }

        console.log(
            "RabbitMQ disconnected successfully"
        );
    } catch (error) {
        console.error(
            "RabbitMQ disconnection failed:",
            error.message
        );

        throw error;
    }
};

module.exports = {
    connectRabbitMQ,
    getChannel,
    closeRabbitMQ,
};