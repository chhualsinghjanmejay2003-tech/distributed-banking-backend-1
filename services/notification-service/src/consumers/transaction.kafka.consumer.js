const {
    Kafka,
} = require("kafkajs");

const KAFKA_BROKERS = (
    process.env.KAFKA_BROKERS ||
    "localhost:9092"
).split(",");

const TOPIC = "banking.transactions";

const GROUP_ID =
    "notification-service";

const kafka = new Kafka({
    clientId:
        "notification-service",

    brokers: KAFKA_BROKERS,
});

const consumer =
    kafka.consumer({
        groupId: GROUP_ID,
    });

const startKafkaConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: TOPIC,
        fromBeginning: true,
    });

    await consumer.run({
        eachMessage: async ({
            topic,
            partition,
            message,
        }) => {
            try {
                const event =
                    JSON.parse(
                        message.value.toString()
                    );

                console.log(
                    "Kafka transaction event received:"
                );

                console.log({
                    topic,
                    partition,
                    event,
                });
            } catch (error) {
                console.error(
                    "Failed to process Kafka event:",
                    error.message
                );
            }
        },
    });

    console.log(
        `Kafka consumer listening on topic: ${TOPIC}`
    );
};

const stopKafkaConsumer = async () => {
    await consumer.disconnect();

    console.log(
        "Kafka consumer disconnected"
    );
};

module.exports = {
    startKafkaConsumer,
    stopKafkaConsumer,
};