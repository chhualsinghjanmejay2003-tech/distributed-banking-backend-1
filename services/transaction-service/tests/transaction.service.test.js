jest.mock("../src/repositories/transaction.repository", () => ({
    create: jest.fn(),
    findByTransactionId: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findByAccountId: jest.fn(),
    updateStatus: jest.fn(),
}));

jest.mock("../src/clients/account.client", () => ({
    creditAccount: jest.fn(),
    debitAccount: jest.fn(),
}));

const transactionRepository = require(
    "../src/repositories/transaction.repository"
);

const accountClient = require(
    "../src/clients/account.client"
);

const transactionService = require(
    "../src/services/transaction.service"
);

describe("Transaction Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createTransaction", () => {
        test("should reject when idempotency key is missing", async () => {
            await expect(
                transactionService.createTransaction({
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message: "Idempotency key is required",
                statusCode: 400,
            });

            expect(
                transactionRepository.create
            ).not.toHaveBeenCalled();
        });

        test("should reject when transaction type is missing", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    destinationAccountId: "ACC001",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message: "Transaction type is required",
                statusCode: 400,
            });
        });

        test("should reject invalid transaction type", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "invalid",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message: "Invalid transaction type",
                statusCode: 400,
            });
        });

        test("should reject invalid amount", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: 0,
                })
            ).rejects.toMatchObject({
                message: "Amount must be greater than zero",
                statusCode: 400,
            });
        });

        test("should reject negative amount", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: -100,
                })
            ).rejects.toMatchObject({
                message: "Amount must be greater than zero",
                statusCode: 400,
            });
        });

        test("should reject non-number amount", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: "1000",
                })
            ).rejects.toMatchObject({
                message: "Amount must be greater than zero",
                statusCode: 400,
            });
        });

        test("should reject deposit without destination account", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message:
                    "Destination account is required for deposit",
                statusCode: 400,
            });
        });

        test("should reject withdrawal without source account", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "withdrawal",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message:
                    "Source account is required for withdrawal",
                statusCode: 400,
            });
        });

        test("should reject transfer without source account", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "transfer",
                    destinationAccountId: "ACC002",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message:
                    "Source account is required for transfer",
                statusCode: 400,
            });
        });

        test("should reject transfer without destination account", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "transfer",
                    sourceAccountId: "ACC001",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message:
                    "Destination account is required for transfer",
                statusCode: 400,
            });
        });

        test("should reject transfer to the same account", async () => {
            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "transfer",
                    sourceAccountId: "ACC001",
                    destinationAccountId: "ACC001",
                    amount: 1000,
                })
            ).rejects.toMatchObject({
                message:
                    "Source and destination accounts must be different",
                statusCode: 400,
            });
        });

        test("should return existing transaction for duplicate idempotency key", async () => {
            const existingTransaction = {
                transactionId: "txn-existing",
                idempotencyKey: "idem-123",
                type: "deposit",
                destinationAccountId: "ACC001",
                amount: 5000,
                status: "completed",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(existingTransaction);

            const result =
                await transactionService.createTransaction({
                    idempotencyKey: "idem-123",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: 5000,
                });

            expect(result).toEqual(
                existingTransaction
            );

            expect(
                transactionRepository.create
            ).not.toHaveBeenCalled();

            expect(
                accountClient.creditAccount
            ).not.toHaveBeenCalled();

            expect(
                accountClient.debitAccount
            ).not.toHaveBeenCalled();
        });

        test("should create a deposit transaction", async () => {
            const pendingTransaction = {
                transactionId: "txn-deposit-123",
                idempotencyKey: "idem-deposit",
                type: "deposit",
                sourceAccountId: null,
                destinationAccountId: "ACC001",
                amount: 1000,
                currency: "INR",
                status: "pending",
            };

            const completedTransaction = {
                ...pendingTransaction,
                status: "completed",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(null);

            transactionRepository.create
                .mockResolvedValue(
                    pendingTransaction
                );

            accountClient.creditAccount
                .mockResolvedValue({
                    accountNumber: "ACC001",
                    balance: 1000,
                });

            transactionRepository.updateStatus
                .mockResolvedValue(
                    completedTransaction
                );

            const result =
                await transactionService.createTransaction({
                    idempotencyKey: "idem-deposit",
                    type: "deposit",
                    destinationAccountId: "ACC001",
                    amount: 1000,
                });

            expect(
                transactionRepository.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    idempotencyKey: "idem-deposit",
                    type: "deposit",
                    sourceAccountId: null,
                    destinationAccountId: "ACC001",
                    amount: 1000,
                    currency: "INR",
                    status: "pending",
                })
            );

            expect(
                accountClient.creditAccount
            ).toHaveBeenCalledWith(
                "ACC001",
                1000
            );

            expect(
                transactionRepository.updateStatus
            ).toHaveBeenCalledWith(
                "txn-deposit-123",
                "completed"
            );

            expect(result).toEqual(
                completedTransaction
            );
        });

        test("should create a withdrawal transaction", async () => {
            const pendingTransaction = {
                transactionId: "txn-withdrawal-123",
                idempotencyKey: "idem-withdrawal",
                type: "withdrawal",
                sourceAccountId: "ACC001",
                destinationAccountId: null,
                amount: 2000,
                currency: "INR",
                status: "pending",
            };

            const completedTransaction = {
                ...pendingTransaction,
                status: "completed",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(null);

            transactionRepository.create
                .mockResolvedValue(
                    pendingTransaction
                );

            accountClient.debitAccount
                .mockResolvedValue({
                    accountNumber: "ACC001",
                    balance: 3000,
                });

            transactionRepository.updateStatus
                .mockResolvedValue(
                    completedTransaction
                );

            const result =
                await transactionService.createTransaction({
                    idempotencyKey: "idem-withdrawal",
                    type: "withdrawal",
                    sourceAccountId: "ACC001",
                    amount: 2000,
                });

            expect(
                transactionRepository.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    idempotencyKey: "idem-withdrawal",
                    type: "withdrawal",
                    sourceAccountId: "ACC001",
                    destinationAccountId: null,
                    amount: 2000,
                    currency: "INR",
                    status: "pending",
                })
            );

            expect(
                accountClient.debitAccount
            ).toHaveBeenCalledWith(
                "ACC001",
                2000
            );

            expect(
                transactionRepository.updateStatus
            ).toHaveBeenCalledWith(
                "txn-withdrawal-123",
                "completed"
            );

            expect(result).toEqual(
                completedTransaction
            );
        });

        test("should create a transfer transaction", async () => {
            const pendingTransaction = {
                transactionId: "txn-transfer-123",
                idempotencyKey: "idem-transfer",
                type: "transfer",
                sourceAccountId: "ACC001",
                destinationAccountId: "ACC002",
                amount: 3000,
                currency: "INR",
                status: "pending",
            };

            const completedTransaction = {
                ...pendingTransaction,
                status: "completed",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(null);

            transactionRepository.create
                .mockResolvedValue(
                    pendingTransaction
                );

            accountClient.debitAccount
                .mockResolvedValue({
                    accountNumber: "ACC001",
                    balance: 7000,
                });

            accountClient.creditAccount
                .mockResolvedValue({
                    accountNumber: "ACC002",
                    balance: 8000,
                });

            transactionRepository.updateStatus
                .mockResolvedValue(
                    completedTransaction
                );

            const result =
                await transactionService.createTransaction({
                    idempotencyKey: "idem-transfer",
                    type: "transfer",
                    sourceAccountId: "ACC001",
                    destinationAccountId: "ACC002",
                    amount: 3000,
                });

            expect(
                accountClient.debitAccount
            ).toHaveBeenCalledWith(
                "ACC001",
                3000
            );

            expect(
                accountClient.creditAccount
            ).toHaveBeenCalledWith(
                "ACC002",
                3000
            );

            expect(
                accountClient.debitAccount
                    .mock.invocationCallOrder[0]
            ).toBeLessThan(
                accountClient.creditAccount
                    .mock.invocationCallOrder[0]
            );

            expect(
                transactionRepository.updateStatus
            ).toHaveBeenCalledWith(
                "txn-transfer-123",
                "completed"
            );

            expect(result).toEqual(
                completedTransaction
            );
        });

        test("should mark transaction as failed when account operation fails", async () => {
            const pendingTransaction = {
                transactionId: "txn-failed-123",
                idempotencyKey: "idem-failed",
                type: "withdrawal",
                sourceAccountId: "ACC001",
                destinationAccountId: null,
                amount: 5000,
                currency: "INR",
                status: "pending",
            };

            transactionRepository.findByIdempotencyKey
                .mockResolvedValue(null);

            transactionRepository.create
                .mockResolvedValue(
                    pendingTransaction
                );

            accountClient.debitAccount
                .mockRejectedValue(
                    new Error(
                        "Insufficient balance"
                    )
                );

            transactionRepository.updateStatus
                .mockResolvedValue({
                    ...pendingTransaction,
                    status: "failed",
                });

            await expect(
                transactionService.createTransaction({
                    idempotencyKey: "idem-failed",
                    type: "withdrawal",
                    sourceAccountId: "ACC001",
                    amount: 5000,
                })
            ).rejects.toThrow(
                "Insufficient balance"
            );

            expect(
                transactionRepository.updateStatus
            ).toHaveBeenCalledWith(
                "txn-failed-123",
                "failed"
            );
        });
    });

    describe("getTransactionById", () => {
        test("should return transaction", async () => {
            const transaction = {
                transactionId: "txn-123",
                type: "deposit",
                amount: 1000,
                status: "completed",
            };

            transactionRepository.findByTransactionId
                .mockResolvedValue(transaction);

            const result =
                await transactionService.getTransactionById(
                    "txn-123"
                );

            expect(
                transactionRepository.findByTransactionId
            ).toHaveBeenCalledWith(
                "txn-123"
            );

            expect(result).toEqual(
                transaction
            );
        });

        test("should throw 404 when transaction does not exist", async () => {
            transactionRepository.findByTransactionId
                .mockResolvedValue(null);

            await expect(
                transactionService.getTransactionById(
                    "txn-not-found"
                )
            ).rejects.toMatchObject({
                message: "Transaction not found",
                statusCode: 404,
            });
        });
    });

    describe("getTransactionsByAccountId", () => {
        test("should reject when account ID is missing", async () => {
            await expect(
                transactionService.getTransactionsByAccountId()
            ).rejects.toMatchObject({
                message: "Account ID is required",
                statusCode: 400,
            });
        });

        test("should return transactions for an account", async () => {
            const transactions = [
                {
                    transactionId: "txn-1",
                    sourceAccountId: "ACC001",
                    amount: 1000,
                },
                {
                    transactionId: "txn-2",
                    destinationAccountId: "ACC001",
                    amount: 2000,
                },
            ];

            transactionRepository.findByAccountId
                .mockResolvedValue(
                    transactions
                );

            const result =
                await transactionService.getTransactionsByAccountId(
                    "ACC001"
                );

            expect(
                transactionRepository.findByAccountId
            ).toHaveBeenCalledWith(
                "ACC001"
            );

            expect(result).toEqual(
                transactions
            );
        });
    });
});