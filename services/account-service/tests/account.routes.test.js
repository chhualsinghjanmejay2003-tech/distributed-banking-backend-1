jest.mock("../src/middleware/auth.middleware", () =>
    jest.fn((req, res, next) => {
        req.user = {
            id: "user-id-123",
            role: "customer",
        };

        next();
    })
);

jest.mock("../src/services/account.service", () => ({
    createAccount: jest.fn(),
    getAccountByNumber: jest.fn(),
    getAccountsByUserId: jest.fn(),
}));

const request = require("supertest");

const app = require("../src/app");

const accountService = require(
    "../src/services/account.service"
);

describe("Account Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /accounts", () => {
        test("should create an account", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-id-123",
                accountNumber: "123456789012",
                balance: 0,
                currency: "INR",
                status: "active",
            };

            accountService.createAccount
                .mockResolvedValue(account);

            const response = await request(app)
                .post("/accounts")
                .set(
                    "Authorization",
                    "Bearer test-token"
                )
                .send();

            expect(response.status).toBe(201);

            expect(
                accountService.createAccount
            ).toHaveBeenCalledWith({
                userId: "user-id-123",
            });

            expect(response.body).toEqual({
                status: "success",
                data: {
                    account,
                },
            });
        });
    });

    describe("GET /accounts", () => {
        test("should return user's accounts", async () => {
            const accounts = [
                {
                    _id: "account-id-1",
                    userId: "user-id-123",
                    accountNumber: "111111111111",
                    balance: 1000,
                    currency: "INR",
                    status: "active",
                },
            ];

            accountService.getAccountsByUserId
                .mockResolvedValue(accounts);

            const response = await request(app)
                .get("/accounts")
                .set(
                    "Authorization",
                    "Bearer test-token"
                );

            expect(response.status).toBe(200);

            expect(
                accountService.getAccountsByUserId
            ).toHaveBeenCalledWith(
                "user-id-123"
            );

            expect(response.body).toEqual({
                status: "success",
                data: {
                    accounts,
                },
            });
        });
    });

    describe("GET /accounts/:accountNumber", () => {
        test("should return account", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-id-123",
                accountNumber: "123456789012",
                balance: 5000,
                currency: "INR",
                status: "active",
            };

            accountService.getAccountByNumber
                .mockResolvedValue(account);

            const response = await request(app)
                .get(
                    "/accounts/123456789012"
                )
                .set(
                    "Authorization",
                    "Bearer test-token"
                );

            expect(response.status).toBe(200);

            expect(
                accountService.getAccountByNumber
            ).toHaveBeenCalledWith(
                "123456789012",
                "user-id-123"
            );

            expect(response.body).toEqual({
                status: "success",
                data: {
                    account,
                },
            });
        });
    });

    test("should return 404 for unknown route", async () => {
        const response = await request(app)
            .get("/something-that-does-not-exist");

        expect(response.status).toBe(404);
    });
});