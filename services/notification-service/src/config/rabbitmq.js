const amqp = require("amqplib");

const RABBITMQ_URL =
    process.env.RABBITMQ_URL ||
    "amqp://localhost:5672";

const EXCHANGE_NAME =
    "banking.transaction.events";

const QUEUE_NAME =
    "notification.transaction.queue";

const connectRabbitMQ = async () => {
    const connection =
        await amqp.connect(RABBITMQ_URL);

    const channel =
        await connection.createChannel();

    await channel.assertExchange(
        EXCHANGE_NAME,
        "topic",
        {
            durable: true,
        }
    );

    await channel.assertQueue(
        QUEUE_NAME,
        {
            durable: true,
        }
    );

    await channel.bindQueue(
        QUEUE_NAME,
        EXCHANGE_NAME,
        "transaction.*"
    );

    console.log(
        "Notification Service connected to RabbitMQ"
    );

    return {
        connection,
        channel,
    };
};

module.exports = {
    connectRabbitMQ,
    EXCHANGE_NAME,
    QUEUE_NAME,
};