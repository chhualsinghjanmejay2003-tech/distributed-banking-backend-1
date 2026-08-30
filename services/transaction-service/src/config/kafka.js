const {
    Kafka,
} = require("kafkajs");


const {
    readiness,
} = require("./readiness");


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

    try {

        await producer.connect();

        readiness.kafka = true;


        console.log(
            "Kafka producer connected successfully"
        );

    } catch (error) {

        readiness.kafka = false;

        console.error(
            "Kafka producer connection failed:",
            error.message
        );

        throw error;
    }
};


const disconnectKafka = async () => {

    try {

        readiness.kafka = false;

        await producer.disconnect();


        console.log(
            "Kafka producer disconnected successfully"
        );

    } catch (error) {

        readiness.kafka = false;

        console.error(
            "Kafka producer disconnection failed:",
            error.message
        );

        throw error;
    }
};


module.exports = {
    producer,
    connectKafka,
    disconnectKafka,
};