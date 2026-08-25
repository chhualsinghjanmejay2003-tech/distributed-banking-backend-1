const Transaction = require(
    "../src/models/transaction.model"
);

describe("Transaction Model", () => {
    test("should create a valid deposit transaction", () => {
        const transaction = new Transaction({
            transactionId: "txn-123",
            idempotencyKey: "idem-123",
            type: "deposit",
            destinationAccountId:
                "507f1f77bcf86cd799439011",
            amount: 5000,
            currency: "INR",
            status: "completed",
        });

        const error = transaction.validateSync();

        expect(error).toBeUndefined();
    });

    test("should create a valid withdrawal transaction", () => {
        const transaction = new Transaction({
            transactionId: "txn-124",
            idempotencyKey: "idem-124",
            type: "withdrawal",
            sourceAccountId:
                "507f1f77bcf86cd799439011",
            amount: 2000,
            currency: "INR",
        });

        const error = transaction.validateSync();

        expect(error).toBeUndefined();
    });

    test("should create a valid transfer transaction", () => {
        const transaction = new Transaction({
            transactionId: "txn-125",
            idempotencyKey: "idem-125",
            type: "transfer",
            sourceAccountId:
                "507f1f77bcf86cd799439011",
            destinationAccountId:
                "507f1f77bcf86cd799439012",
            amount: 1000,
            currency: "INR",
        });

        const error = transaction.validateSync();

        expect(error).toBeUndefined();
    });

    test("should reject invalid transaction type", () => {
        const transaction = new Transaction({
            transactionId: "txn-126",
            idempotencyKey: "idem-126",
            type: "invalid",
            amount: 1000,
        });

        const error = transaction.validateSync();

        expect(error).toBeDefined();
        expect(error.errors.type).toBeDefined();
    });

    test("should reject amount less than 0.01", () => {
        const transaction = new Transaction({
            transactionId: "txn-127",
            idempotencyKey: "idem-127",
            type: "deposit",
            amount: 0,
        });

        const error = transaction.validateSync();

        expect(error).toBeDefined();
        expect(error.errors.amount).toBeDefined();
    });

    test("should reject transaction without transactionId", () => {
        const transaction = new Transaction({
            idempotencyKey: "idem-128",
            type: "deposit",
            amount: 1000,
        });

        const error = transaction.validateSync();

        expect(error).toBeDefined();
        expect(
            error.errors.transactionId
        ).toBeDefined();
    });

    test("should reject transaction without idempotencyKey", () => {
        const transaction = new Transaction({
            transactionId: "txn-129",
            type: "deposit",
            amount: 1000,
        });

        const error = transaction.validateSync();

        expect(error).toBeDefined();
        expect(
            error.errors.idempotencyKey
        ).toBeDefined();
    });

    test("should default currency to INR", () => {
        const transaction = new Transaction({
            transactionId: "txn-130",
            idempotencyKey: "idem-130",
            type: "deposit",
            amount: 1000,
        });

        expect(transaction.currency).toBe("INR");
    });

    test("should default status to pending", () => {
        const transaction = new Transaction({
            transactionId: "txn-131",
            idempotencyKey: "idem-131",
            type: "deposit",
            amount: 1000,
        });

        expect(transaction.status).toBe(
            "pending"
        );
    });
});