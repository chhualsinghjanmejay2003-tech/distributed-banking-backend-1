const {
    redisClient,
} = require("../src/config/redis");

const {
    createSession,
    getSession,
    deleteSession,
} = require("../src/repositories/session.repository");

describe("Session Repository", () => {
    const refreshToken = `test-refresh-token-${Date.now()}`;

    const sessionData = {
        userId: "user-id-123",
        role: "customer",
    };

    beforeAll(async () => {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    });

    afterAll(async () => {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    });

    test("should create and retrieve a session", async () => {
        await createSession(
            refreshToken,
            sessionData,
            60
        );

        const session = await getSession(
            refreshToken
        );

        expect(session).toEqual(sessionData);
    });

    test("should return null for a missing session", async () => {
        const session = await getSession(
            "non-existent-refresh-token"
        );

        expect(session).toBeNull();
    });

    test("should delete a session", async () => {
        const token = `delete-test-${Date.now()}`;

        await createSession(
            token,
            sessionData,
            60
        );

        await deleteSession(token);

        const session = await getSession(token);

        expect(session).toBeNull();
    });
});