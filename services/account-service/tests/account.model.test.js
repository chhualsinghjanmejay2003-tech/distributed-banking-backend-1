const Account = require(
    "../src/models/account.model"
);

describe("Account Model", () => {
    test("should create an account with default values", () => {
        const account = new Account({
            userId: "507f1f77bcf86cd799439011",
            accountNumber: "100000000001",
        });

        expect(account.accountNumber).toBe(
            "100000000001"
        );

        expect(account.balance).toBe(0);

        expect(account.currency).toBe("INR");

        expect(account.status).toBe("active");
    });

    test("should require userId", async () => {
        const account = new Account({
            accountNumber: "100000000001",
        });

        const error = account.validateSync();

        expect(error.errors.userId).toBeDefined();
    });

    test("should require accountNumber", async () => {
        const account = new Account({
            userId: "507f1f77bcf86cd799439011",
        });

        const error = account.validateSync();

        expect(
            error.errors.accountNumber
        ).toBeDefined();
    });

    test("should reject negative balance", () => {
        const account = new Account({
            userId: "507f1f77bcf86cd799439011",
            accountNumber: "100000000001",
            balance: -100,
        });

        const error = account.validateSync();

        expect(
            error.errors.balance
        ).toBeDefined();
    });

    test("should reject unsupported currency", () => {
        const account = new Account({
            userId: "507f1f77bcf86cd799439011",
            accountNumber: "100000000001",
            currency: "USD",
        });

        const error = account.validateSync();

        expect(
            error.errors.currency
        ).toBeDefined();
    });

    test("should reject unsupported status", () => {
        const account = new Account({
            userId: "507f1f77bcf86cd799439011",
            accountNumber: "100000000001",
            status: "invalid",
        });

        const error = account.validateSync();

        expect(
            error.errors.status
        ).toBeDefined();
    });
});