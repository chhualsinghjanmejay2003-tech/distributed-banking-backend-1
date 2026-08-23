const { createClient } = require("redis");

describe("Redis connection", () => {
    let client;

    beforeAll(async () => {
        client = createClient({
            url: process.env.REDIS_URL || "redis://localhost:6379",
        });

        await client.connect();
    });

    afterAll(async () => {
        if (client?.isOpen) {
            await client.quit();
        }
    });

    test("should connect to Redis and respond to PING", async () => {
        const response = await client.ping();

        expect(response).toBe("PONG");
    });
});