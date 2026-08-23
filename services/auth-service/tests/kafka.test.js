const { Kafka } = require("kafkajs");

describe("Kafka connection", () => {
    let producer;

    beforeAll(async () => {
        const kafka = new Kafka({
            clientId: "auth-service-test",
            brokers: (
                process.env.KAFKA_BROKERS ||
                "localhost:9092"
            ).split(","),
        });

        producer = kafka.producer();

        await producer.connect();
    });

    afterAll(async () => {
        if (producer) {
            await producer.disconnect();
        }
    });

    test("should connect to Kafka", async () => {
        expect(producer).toBeDefined();
    });
});