jest.mock(
    "../src/repositories/transaction.repository",
    () => ({
        create: jest.fn(),
        findByTransactionId: jest.fn(),
        findByIdempotencyKey: jest.fn(),
        findByAccountId: jest.fn(),
    })
);

const transactionRepository = require(
    "../src/repositories/transaction.repository"
);

const transactionService = require(
    "../src/services/transaction.service"
);

describe("Transaction Service", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("createTransaction", () => {
        test("should create a deposit transaction", async () => {
            const transaction = {
                transactionId: "txn-123",
                idempotencyKey: "idem-123",
                type: "deposit",
                sourceAccountId: null,
                destinationAccountId: "account-123",
                amount: 5000,
                currency: "INR",
                status: "pending",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(null);

            transactionRepository.create
                .mockResolvedValue(transaction);

            const result =
                await transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "account-123",
                    amount: 5000,
                    currency: "INR",
                });

            expect(
                transactionRepository.findByIdempotencyKey
            ).toHaveBeenCalledWith("idem-123");

            expect(
                transactionRepository.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    sourceAccountId: null,
                    destinationAccountId: "account-123",
                    amount: 5000,
                    currency: "INR",
                    status: "pending",
                    transactionId: expect.any(String),
                })
            );

            expect(result).toEqual(transaction);
        });

        test(
            "should return existing transaction for duplicate idempotency key",
            async () => {
                const existingTransaction = {
                    transactionId: "txn-existing",
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    amount: 5000,
                    status: "completed",
                };

                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(existingTransaction);

                const result =
                    await transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "deposit",
                        destinationAccountId: "account-123",
                        amount: 5000,
                    });

                expect(result).toEqual(
                    existingTransaction
                );

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject missing idempotency key",
            async () => {
                await expect(
                    transactionService.createTransaction({
                        type: "deposit",
                        destinationAccountId: "account-123",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message: "Idempotency key is required",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.findByIdempotencyKey
                ).not.toHaveBeenCalled();

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject invalid transaction type",
            async () => {
                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "invalid",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message: "Invalid transaction type",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.findByIdempotencyKey
                ).not.toHaveBeenCalled();

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject zero amount",
            async () => {
                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "deposit",
                        destinationAccountId: "account-123",
                        amount: 0,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Amount must be greater than zero",
                    statusCode: 400,
                });
            }
        );

        test(
            "should reject negative amount",
            async () => {
                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "deposit",
                        destinationAccountId: "account-123",
                        amount: -100,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Amount must be greater than zero",
                    statusCode: 400,
                });
            }
        );

        test(
            "should reject deposit without destination account",
            async () => {
                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(null);

                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "deposit",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Destination account is required for deposit",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject withdrawal without source account",
            async () => {
                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(null);

                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "withdrawal",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Source account is required for withdrawal",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject transfer without source account",
            async () => {
                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(null);

                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "transfer",
                        destinationAccountId: "account-456",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Source account is required for transfer",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject transfer without destination account",
            async () => {
                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(null);

                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "transfer",
                        sourceAccountId: "account-123",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Destination account is required for transfer",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );

        test(
            "should reject transfer to the same account",
            async () => {
                transactionRepository.findByIdempotencyKey
                    .mockResolvedValue(null);

                await expect(
                    transactionService.createTransaction({
                        idempotencyKey: "idem-123",
                        type: "transfer",
                        sourceAccountId: "account-123",
                        destinationAccountId: "account-123",
                        amount: 5000,
                    })
                ).rejects.toMatchObject({
                    message:
                        "Source and destination accounts must be different",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.create
                ).not.toHaveBeenCalled();
            }
        );
    });

    describe("getTransactionById", () => {
        test(
            "should return transaction",
            async () => {
                const transaction = {
                    transactionId: "txn-123",
                    type: "deposit",
                    amount: 5000,
                };

                transactionRepository.findByTransactionId
                    .mockResolvedValue(transaction);

                const result =
                    await transactionService
                        .getTransactionById("txn-123");

                expect(
                    transactionRepository.findByTransactionId
                ).toHaveBeenCalledWith("txn-123");

                expect(result).toEqual(transaction);
            }
        );

        test(
            "should reject when transaction does not exist",
            async () => {
                transactionRepository.findByTransactionId
                    .mockResolvedValue(null);

                await expect(
                    transactionService
                        .getTransactionById("txn-123")
                ).rejects.toMatchObject({
                    message: "Transaction not found",
                    statusCode: 404,
                });
            }
        );
    });

    describe("getTransactionsByAccountId", () => {
        test(
            "should return account transactions",
            async () => {
                const transactions = [
                    {
                        transactionId: "txn-1",
                    },
                    {
                        transactionId: "txn-2",
                    },
                ];

                transactionRepository.findByAccountId
                    .mockResolvedValue(transactions);

                const result =
                    await transactionService
                        .getTransactionsByAccountId(
                            "account-123"
                        );

                expect(
                    transactionRepository.findByAccountId
                ).toHaveBeenCalledWith(
                    "account-123"
                );

                expect(result).toEqual(transactions);
            }
        );

        test(
            "should reject missing account ID",
            async () => {
                await expect(
                    transactionService
                        .getTransactionsByAccountId()
                ).rejects.toMatchObject({
                    message: "Account ID is required",
                    statusCode: 400,
                });

                expect(
                    transactionRepository.findByAccountId
                ).not.toHaveBeenCalled();
            }
        );
    });
});