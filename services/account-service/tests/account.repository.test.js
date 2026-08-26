jest.mock("../src/models/account.model", () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
}));

const Account = require("../src/models/account.model");

const accountRepository = require(
    "../src/repositories/account.repository"
);

describe("Account Repository", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    test("should create an account", async () => {
        const accountData = {
            userId: "user-id-123",
            accountNumber: "123456789012",
            balance: 0,
            currency: "INR",
            status: "active",
        };

        const account = {
            _id: "account-id-123",
            ...accountData,
        };

        Account.create.mockResolvedValue(account);

        const result =
            await accountRepository.create(
                accountData
            );

        expect(Account.create).toHaveBeenCalledWith(
            accountData
        );

        expect(result).toEqual(account);
    });

    test(
        "should find account by account number",
        async () => {
            const account = {
                _id: "account-id-123",
                accountNumber: "123456789012",
            };

            Account.findOne.mockResolvedValue(account);

            const result =
                await accountRepository
                    .findByAccountNumber(
                        "123456789012"
                    );

            expect(Account.findOne).toHaveBeenCalledWith({
                accountNumber: "123456789012",
            });

            expect(result).toEqual(account);
        }
    );

    test(
        "should find accounts by user ID",
        async () => {
            const accounts = [
                {
                    _id: "account-id-1",
                    userId: "user-id-123",
                },
                {
                    _id: "account-id-2",
                    userId: "user-id-123",
                },
            ];

            Account.find.mockResolvedValue(accounts);

            const result =
                await accountRepository
                    .findByUserId("user-id-123");

            expect(Account.find).toHaveBeenCalledWith({
                userId: "user-id-123",
            });

            expect(result).toEqual(accounts);
        }
    );

    test(
        "should credit an active account",
        async () => {
            const account = {
                accountNumber: "123456789012",
                balance: 6000,
                status: "active",
            };

            Account.findOneAndUpdate
                .mockResolvedValue(account);

            const result =
                await accountRepository.creditAccount(
                    "123456789012",
                    1000
                );

            expect(
                Account.findOneAndUpdate
            ).toHaveBeenCalledWith(
                {
                    accountNumber: "123456789012",
                    status: "active",
                },
                {
                    $inc: {
                        balance: 1000,
                    },
                },
                {
                    new: true,
                }
            );

            expect(result).toEqual(account);
        }
    );

    test(
        "should debit an active account with sufficient balance",
        async () => {
            const account = {
                accountNumber: "123456789012",
                balance: 4000,
                status: "active",
            };

            Account.findOneAndUpdate
                .mockResolvedValue(account);

            const result =
                await accountRepository.debitAccount(
                    "123456789012",
                    1000
                );

            expect(
                Account.findOneAndUpdate
            ).toHaveBeenCalledWith(
                {
                    accountNumber: "123456789012",
                    status: "active",
                    balance: {
                        $gte: 1000,
                    },
                },
                {
                    $inc: {
                        balance: -1000,
                    },
                },
                {
                    new: true,
                }
            );

            expect(result).toEqual(account);
        }
    );

    test(
        "should return null when debit cannot be performed",
        async () => {
            Account.findOneAndUpdate
                .mockResolvedValue(null);

            const result =
                await accountRepository.debitAccount(
                    "123456789012",
                    5000
                );

            expect(result).toBeNull();

            expect(
                Account.findOneAndUpdate
            ).toHaveBeenCalledWith(
                {
                    accountNumber: "123456789012",
                    status: "active",
                    balance: {
                        $gte: 5000,
                    },
                },
                {
                    $inc: {
                        balance: -5000,
                    },
                },
                {
                    new: true,
                }
            );
        }
    );
});