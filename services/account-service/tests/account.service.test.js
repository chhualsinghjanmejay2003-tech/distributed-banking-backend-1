jest.mock("../src/repositories/account.repository", () => ({
    create: jest.fn(),
    findByAccountNumber: jest.fn(),
    findByUserId: jest.fn(),
}));

const accountRepository = require(
    "../src/repositories/account.repository"
);

const accountService = require(
    "../src/services/account.service"
);

describe("Account Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createAccount", () => {
        test("should create an account successfully", async () => {
            const userId = "user-id-123";

            const createdAccount = {
                _id: "account-id-123",
                userId,
                accountNumber: "123456789012",
                balance: 0,
                currency: "INR",
                status: "active",
            };

            accountRepository.findByAccountNumber
                .mockResolvedValue(null);

            accountRepository.create
                .mockResolvedValue(createdAccount);

            const result =
                await accountService.createAccount({
                    userId,
                });

            expect(
                accountRepository.findByAccountNumber
            ).toHaveBeenCalled();

            expect(
                accountRepository.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    accountNumber: expect.any(String),
                    balance: 0,
                    currency: "INR",
                    status: "active",
                })
            );

            expect(result).toEqual(
                createdAccount
            );
        });

        test("should reject account creation without userId", async () => {
            await expect(
                accountService.createAccount({})
            ).rejects.toMatchObject({
                message: "User ID is required",
                statusCode: 400,
            });

            expect(
                accountRepository.create
            ).not.toHaveBeenCalled();
        });

        test("should retry when account number already exists", async () => {
            const existingAccount = {
                _id: "existing-account",
                accountNumber: "123456789012",
            };

            const createdAccount = {
                _id: "new-account",
                userId: "user-id-123",
                accountNumber: "987654321098",
                balance: 0,
                currency: "INR",
                status: "active",
            };

            accountRepository.findByAccountNumber
                .mockResolvedValueOnce(
                    existingAccount
                )
                .mockResolvedValueOnce(null);

            accountRepository.create
                .mockResolvedValue(
                    createdAccount
                );

            const result =
                await accountService.createAccount({
                    userId: "user-id-123",
                });

            expect(
                accountRepository.findByAccountNumber
            ).toHaveBeenCalledTimes(2);

            expect(
                accountRepository.create
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: "user-id-123",
                    balance: 0,
                    currency: "INR",
                    status: "active",
                    accountNumber:
                        expect.any(String),
                })
            );

            expect(result).toEqual(
                createdAccount
            );
        });

        test("should propagate repository error", async () => {
            accountRepository.findByAccountNumber
                .mockResolvedValue(null);

            accountRepository.create
                .mockRejectedValue(
                    new Error("Database error")
                );

            await expect(
                accountService.createAccount({
                    userId: "user-id-123",
                })
            ).rejects.toThrow(
                "Database error"
            );
        });
    });

    describe("getAccountByNumber", () => {
        test("should return account when it exists and belongs to user", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-id-123",
                accountNumber: "123456789012",
                balance: 5000,
                currency: "INR",
                status: "active",
            };

            accountRepository.findByAccountNumber
                .mockResolvedValue(account);

            const result =
                await accountService.getAccountByNumber(
                    "123456789012",
                    "user-id-123"
                );

            expect(
                accountRepository.findByAccountNumber
            ).toHaveBeenCalledWith(
                "123456789012"
            );

            expect(result).toEqual(account);
        });

        test("should reject when account does not exist", async () => {
            accountRepository.findByAccountNumber
                .mockResolvedValue(null);

            await expect(
                accountService.getAccountByNumber(
                    "123456789012",
                    "user-id-123"
                )
            ).rejects.toMatchObject({
                message: "Account not found",
                statusCode: 404,
            });
        });

        test("should reject when account belongs to another user", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-A",
                accountNumber: "123456789012",
                balance: 5000,
                currency: "INR",
                status: "active",
            };

            accountRepository.findByAccountNumber
                .mockResolvedValue(account);

            await expect(
                accountService.getAccountByNumber(
                    "123456789012",
                    "user-B"
                )
            ).rejects.toMatchObject({
                message:
                    "You are not authorized to access this account",
                statusCode: 403,
            });

            expect(
                accountRepository.findByAccountNumber
            ).toHaveBeenCalledWith(
                "123456789012"
            );
        });

        test("should allow access when account belongs to the user", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-A",
                accountNumber: "123456789012",
                balance: 5000,
                currency: "INR",
                status: "active",
            };

            accountRepository.findByAccountNumber
                .mockResolvedValue(account);

            const result =
                await accountService.getAccountByNumber(
                    "123456789012",
                    "user-A"
                );

            expect(result).toEqual(account);
        });

        test("should propagate repository error", async () => {
            accountRepository.findByAccountNumber
                .mockRejectedValue(
                    new Error("Database error")
                );

            await expect(
                accountService.getAccountByNumber(
                    "123456789012",
                    "user-id-123"
                )
            ).rejects.toThrow(
                "Database error"
            );
        });
    });

    describe("getAccountsByUserId", () => {
        test("should return all accounts belonging to a user", async () => {
            const accounts = [
                {
                    _id: "account-id-1",
                    userId: "user-id-123",
                    accountNumber: "111111111111",
                    balance: 1000,
                    currency: "INR",
                    status: "active",
                },
                {
                    _id: "account-id-2",
                    userId: "user-id-123",
                    accountNumber: "222222222222",
                    balance: 5000,
                    currency: "INR",
                    status: "active",
                },
            ];

            accountRepository.findByUserId
                .mockResolvedValue(accounts);

            const result =
                await accountService.getAccountsByUserId(
                    "user-id-123"
                );

            expect(
                accountRepository.findByUserId
            ).toHaveBeenCalledWith(
                "user-id-123"
            );

            expect(result).toEqual(accounts);
        });

        test("should return an empty array when user has no accounts", async () => {
            accountRepository.findByUserId
                .mockResolvedValue([]);

            const result =
                await accountService.getAccountsByUserId(
                    "user-id-123"
                );

            expect(result).toEqual([]);
        });

        test("should propagate repository error", async () => {
            accountRepository.findByUserId
                .mockRejectedValue(
                    new Error("Database error")
                );

            await expect(
                accountService.getAccountsByUserId(
                    "user-id-123"
                )
            ).rejects.toThrow(
                "Database error"
            );
        });
    });
});