const {
    Kafka,
} = require("kafkajs");

const env = require("./env");
const logger = require("../utils/logger");

const {
    readiness,
} = require("./readiness");


const kafka = new Kafka({
    clientId: "auth-service",
    brokers: env.kafkaBrokers,
});


const producer =
    kafka.producer();


const connectKafka = async () => {

    try {

        await producer.connect();

        readiness.kafka = true;

        logger.info(
            "Kafka connected successfully"
        );

    } catch (error) {

        readiness.kafka = false;

        logger.error(
            { error: error.message },
            "Kafka connection failed"
        );

        throw error;
    }
};


const disconnectKafka = async () => {

    readiness.kafka = false;

    await producer.disconnect();

    logger.info(
        "Kafka connection closed"
    );
};


module.exports = {
    producer,
    connectKafka,
    disconnectKafka,
};