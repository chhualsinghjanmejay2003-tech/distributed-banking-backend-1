jest.mock(
    "../src/models/transaction.model",
    () => ({
        create: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
    })
);

const Transaction = require(
    "../src/models/transaction.model"
);

const transactionRepository = require(
    "../src/repositories/transaction.repository"
);

describe("Transaction Repository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should create a transaction", async () => {
        const transaction = {
            transactionId: "txn-123",
            idempotencyKey: "idem-123",
            type: "deposit",
            destinationAccountId:
                "507f1f77bcf86cd799439011",
            amount: 5000,
            currency: "INR",
            status: "completed",
        };

        Transaction.create.mockResolvedValue(
            transaction
        );

        const result =
            await transactionRepository.create(
                transaction
            );

        expect(
            Transaction.create
        ).toHaveBeenCalledWith(
            transaction
        );

        expect(result).toEqual(
            transaction
        );
    });

    test("should find transaction by transactionId", async () => {
        const transaction = {
            transactionId: "txn-123",
        };

        Transaction.findOne.mockResolvedValue(
            transaction
        );

        const result =
            await transactionRepository
                .findByTransactionId(
                    "txn-123"
                );

        expect(
            Transaction.findOne
        ).toHaveBeenCalledWith({
            transactionId: "txn-123",
        });

        expect(result).toEqual(
            transaction
        );
    });

    test("should find transaction by idempotencyKey", async () => {
        const transaction = {
            transactionId: "txn-123",
            idempotencyKey: "idem-123",
        };

        Transaction.findOne.mockResolvedValue(
            transaction
        );

        const result =
            await transactionRepository
                .findByIdempotencyKey(
                    "idem-123"
                );

        expect(
            Transaction.findOne
        ).toHaveBeenCalledWith({
            idempotencyKey: "idem-123",
        });

        expect(result).toEqual(
            transaction
        );
    });

    test("should find transactions by accountId", async () => {
        const transactions = [
            {
                transactionId: "txn-1",
            },
            {
                transactionId: "txn-2",
            },
        ];

        const sortMock = jest.fn()
            .mockResolvedValue(
                transactions
            );

        Transaction.find.mockReturnValue({
            sort: sortMock,
        });

        const result =
            await transactionRepository
                .findByAccountId(
                    "507f1f77bcf86cd799439011"
                );

        expect(
            Transaction.find
        ).toHaveBeenCalledWith({
            $or: [
                {
                    sourceAccountId:
                        "507f1f77bcf86cd799439011",
                },
                {
                    destinationAccountId:
                        "507f1f77bcf86cd799439011",
                },
            ],
        });

        expect(sortMock).toHaveBeenCalledWith({
            createdAt: -1,
        });

        expect(result).toEqual(
            transactions
        );
    });

    test("should update transaction status", async () => {
        const transaction = {
            transactionId: "txn-123",
            status: "completed",
        };

        Transaction.findOneAndUpdate
            .mockResolvedValue(transaction);

        const result =
            await transactionRepository
                .updateStatus(
                    "txn-123",
                    "completed"
                );

        expect(
            Transaction.findOneAndUpdate
        ).toHaveBeenCalledWith(
            {
                transactionId: "txn-123",
            },
            {
                status: "completed",
            },
            {
                new: true,
            }
        );

        expect(result).toEqual(
            transaction
        );
    });
});