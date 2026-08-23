const { Kafka } = require("kafkajs");
const env = require("./env");
const logger = require("../utils/logger");

const kafka = new Kafka({
    clientId: "auth-service",
    brokers: env.kafkaBrokers,
});

const producer = kafka.producer();

const connectKafka = async () => {
    try {
        await producer.connect();

        logger.info("Kafka connected successfully");
    } catch (error) {
        logger.error(
            { error: error.message },
            "Kafka connection failed"
        );

        throw error;
    }
};

const disconnectKafka = async () => {
    await producer.disconnect();

    logger.info("Kafka connection closed");
};

module.exports = {
    producer,
    connectKafka,
    disconnectKafka,
};