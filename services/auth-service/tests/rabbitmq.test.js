const amqp = require("amqplib");

describe("RabbitMQ connection", () => {
    let connection;
    let channel;

    beforeAll(async () => {
        connection = await amqp.connect(
            process.env.RABBITMQ_URL ||
            "amqp://localhost:5672"
        );

        channel = await connection.createChannel();
    });

    afterAll(async () => {
        if (channel) {
            await channel.close();
        }

        if (connection) {
            await connection.close();
        }
    });

    test("should connect to RabbitMQ", async () => {
        expect(connection).toBeDefined();
        expect(channel).toBeDefined();
    });
});