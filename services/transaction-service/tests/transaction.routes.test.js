jest.mock(
    "../src/services/transaction.service",
    () => ({
        createTransaction: jest.fn(),
        getTransactionById: jest.fn(),
        getTransactionsByAccountId: jest.fn(),
    })
);

const request = require("supertest");

const app = require("../src/app");

const transactionService = require(
    "../src/services/transaction.service"
);

describe("Transaction Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /transactions", () => {
        test("should create a deposit transaction", async () => {
            const transaction = {
                transactionId: "txn-123",
                idempotencyKey: "idem-123",
                type: "deposit",
                sourceAccountId: null,
                destinationAccountId: "ACC001",
                amount: 5000,
                currency: "INR",
                status: "completed",
            };

            transactionService.createTransaction.mockResolvedValue(
                transaction
            );

            const response = await request(app)
                .post("/transactions")
                .send({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: 5000,
                    currency: "INR",
                });

            expect(response.status).toBe(201);

            expect(
                transactionService.createTransaction
            ).toHaveBeenCalledWith({
                idempotencyKey: "idem-123",
                type: "deposit",
                destinationAccountId: "ACC001",
                amount: 5000,
                currency: "INR",
            });

            expect(response.body).toEqual({
                status: "success",
                data: {
                    transaction,
                },
            });
        });

        test("should create a withdrawal transaction", async () => {
            const transaction = {
                transactionId: "txn-124",
                idempotencyKey: "idem-124",
                type: "withdrawal",
                sourceAccountId: "ACC001",
                destinationAccountId: null,
                amount: 2000,
                currency: "INR",
                status: "completed",
            };

            transactionService.createTransaction.mockResolvedValue(
                transaction
            );

            const response = await request(app)
                .post("/transactions")
                .send({
                    idempotencyKey: "idem-124",
                    type: "withdrawal",
                    sourceAccountId: "ACC001",
                    amount: 2000,
                    currency: "INR",
                });

            expect(response.status).toBe(201);

            expect(
                transactionService.createTransaction
            ).toHaveBeenCalledWith({
                idempotencyKey: "idem-124",
                type: "withdrawal",
                sourceAccountId: "ACC001",
                amount: 2000,
                currency: "INR",
            });

            expect(response.body).toEqual({
                status: "success",
                data: {
                    transaction,
                },
            });
        });

        test("should create a transfer transaction", async () => {
            const transaction = {
                transactionId: "txn-125",
                idempotencyKey: "idem-125",
                type: "transfer",
                sourceAccountId: "ACC001",
                destinationAccountId: "ACC002",
                amount: 3000,
                currency: "INR",
                status: "completed",
            };

            transactionService.createTransaction.mockResolvedValue(
                transaction
            );

            const response = await request(app)
                .post("/transactions")
                .send({
                    idempotencyKey: "idem-125",
                    type: "transfer",
                    sourceAccountId: "ACC001",
                    destinationAccountId: "ACC002",
                    amount: 3000,
                    currency: "INR",
                });

            expect(response.status).toBe(201);

            expect(
                transactionService.createTransaction
            ).toHaveBeenCalledWith({
                idempotencyKey: "idem-125",
                type: "transfer",
                sourceAccountId: "ACC001",
                destinationAccountId: "ACC002",
                amount: 3000,
                currency: "INR",
            });

            expect(response.body).toEqual({
                status: "success",
                data: {
                    transaction,
                },
            });
        });
    });

    describe("GET /transactions/:transactionId", () => {
        test("should return a transaction", async () => {
            const transaction = {
                transactionId: "txn-123",
                idempotencyKey: "idem-123",
                type: "deposit",
                sourceAccountId: null,
                destinationAccountId: "ACC001",
                amount: 5000,
                currency: "INR",
                status: "completed",
            };

            transactionService.getTransactionById.mockResolvedValue(
                transaction
            );

            const response = await request(app)
                .get("/transactions/txn-123");

            expect(response.status).toBe(200);

            expect(
                transactionService.getTransactionById
            ).toHaveBeenCalledWith("txn-123");

            expect(response.body).toEqual({
                status: "success",
                data: {
                    transaction,
                },
            });
        });
    });

    describe(
        "GET /transactions/account/:accountId",
        () => {
            test(
                "should return account transactions",
                async () => {
                    const transactions = [
                        {
                            transactionId: "txn-123",
                            type: "deposit",
                            sourceAccountId: null,
                            destinationAccountId:
                                "ACC001",
                            amount: 5000,
                            currency: "INR",
                            status: "completed",
                        },
                        {
                            transactionId: "txn-124",
                            type: "withdrawal",
                            sourceAccountId:
                                "ACC001",
                            destinationAccountId: null,
                            amount: 2000,
                            currency: "INR",
                            status: "completed",
                        },
                    ];

                    transactionService
                        .getTransactionsByAccountId
                        .mockResolvedValue(
                            transactions
                        );

                    const response =
                        await request(app)
                            .get(
                                "/transactions/account/ACC001"
                            );

                    expect(
                        response.status
                    ).toBe(200);

                    expect(
                        transactionService
                            .getTransactionsByAccountId
                    ).toHaveBeenCalledWith(
                        "ACC001"
                    );

                    expect(
                        response.body
                    ).toEqual({
                        status: "success",
                        data: {
                            transactions,
                        },
                    });
                }
            );
        }
    );

    test("should return 404 for unknown route", async () => {
        const response = await request(app)
            .get(
                "/something-that-does-not-exist"
            );

        expect(response.status).toBe(404);
    });
});