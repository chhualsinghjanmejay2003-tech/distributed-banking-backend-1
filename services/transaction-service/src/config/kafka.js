const {
    Kafka,
} = require("kafkajs");

const kafka = new Kafka({
    clientId:
        "transaction-service",

    brokers: (
        process.env.KAFKA_BROKERS ||
        "localhost:9092"
    ).split(","),
});

const producer =
    kafka.producer();

const connectKafka = async () => {
    await producer.connect();

    console.log(
        "Kafka producer connected successfully"
    );
};

const disconnectKafka = async () => {
    await producer.disconnect();

    console.log(
        "Kafka producer disconnected successfully"
    );
};

module.exports = {
    producer,
    connectKafka,
    disconnectKafka,
};