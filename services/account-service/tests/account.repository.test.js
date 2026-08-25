jest.mock("../src/models/account.model", () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
}));

const Account = require("../src/models/account.model");
const accountRepository = require(
    "../src/repositories/account.repository"
);

describe("Account Repository", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should create an account", async () => {
        const accountData = {
            userId: "507f1f77bcf86cd799439011",
            accountNumber: "100000000001",
        };

        const createdAccount = {
            _id: "account-id",
            ...accountData,
            balance: 0,
            currency: "INR",
            status: "active",
        };

        Account.create.mockResolvedValue(
            createdAccount
        );

        const result =
            await accountRepository.create(
                accountData
            );

        expect(Account.create).toHaveBeenCalledWith(
            accountData
        );

        expect(result).toEqual(
            createdAccount
        );
    });

    test("should find account by account number", async () => {
        const account = {
            _id: "account-id",
            accountNumber: "100000000001",
        };

        Account.findOne.mockResolvedValue(account);

        const result =
            await accountRepository.findByAccountNumber(
                "100000000001"
            );

        expect(Account.findOne).toHaveBeenCalledWith({
            accountNumber: "100000000001",
        });

        expect(result).toEqual(account);
    });

    test("should find accounts by user id", async () => {
        const accounts = [
            {
                _id: "account-id-1",
                userId: "507f1f77bcf86cd799439011",
            },
            {
                _id: "account-id-2",
                userId: "507f1f77bcf86cd799439011",
            },
        ];

        Account.find.mockResolvedValue(accounts);

        const result =
            await accountRepository.findByUserId(
                "507f1f77bcf86cd799439011"
            );

        expect(Account.find).toHaveBeenCalledWith({
            userId: "507f1f77bcf86cd799439011",
        });

        expect(result).toEqual(accounts);
    });
});