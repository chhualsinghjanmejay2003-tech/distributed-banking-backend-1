const amqp = require("amqplib");

const env = require("./env");

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


        /*
         * Connection lifecycle
         */

        connection.on(
            "error",
            (error) => {

                readiness.rabbitmq = false;

                console.error(
                    "RabbitMQ connection error:",
                    error.message
                );
            }
        );


        connection.on(
            "close",
            () => {

                readiness.rabbitmq = false;

                connection = null;
                channel = null;

                console.warn(
                    "RabbitMQ connection closed"
                );
            }
        );


        readiness.rabbitmq = true;


        console.log(
            "RabbitMQ connected successfully"
        );


        return channel;

    } catch (error) {

        readiness.rabbitmq = false;

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

        readiness.rabbitmq = false;


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

        readiness.rabbitmq = false;

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