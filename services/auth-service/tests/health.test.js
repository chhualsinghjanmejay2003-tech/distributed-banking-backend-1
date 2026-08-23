const request = require("supertest");
const app = require("../src/app");

describe("Health endpoint", () => {
    test("GET /health should return service health", async () => {
        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            status: "ok",
            service: "auth-service"
        });
    });
});