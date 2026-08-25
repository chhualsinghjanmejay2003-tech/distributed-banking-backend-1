jest.mock(
    "../src/repositories/account.repository",
    () => ({
        create: jest.fn(),
        findByAccountNumber: jest.fn(),
        findByUserId: jest.fn(),
    })
);

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

    test("should create an account", async () => {
        accountRepository.findByAccountNumber
            .mockResolvedValue(null);

        const account = {
            _id: "account-id",
            userId: "user-id",
            accountNumber: "123456789012",
            balance: 0,
            currency: "INR",
            status: "active",
        };

        accountRepository.create
            .mockResolvedValue(account);

        const result =
            await accountService.createAccount({
                userId: "user-id",
            });

        expect(
            accountRepository.findByAccountNumber
        ).toHaveBeenCalled();

        expect(
            accountRepository.create
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "user-id",
                balance: 0,
                currency: "INR",
                status: "active",
            })
        );

        expect(result).toEqual(account);
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

    test("should retry when generated account number already exists", async () => {
        accountRepository.findByAccountNumber
            .mockResolvedValueOnce({
                _id: "existing-account",
            })
            .mockResolvedValueOnce(null);

        const account = {
            _id: "new-account",
            userId: "user-id",
            accountNumber: "123456789012",
            balance: 0,
            currency: "INR",
            status: "active",
        };

        accountRepository.create
            .mockResolvedValue(account);

        const result =
            await accountService.createAccount({
                userId: "user-id",
            });

        expect(
            accountRepository.findByAccountNumber
        ).toHaveBeenCalledTimes(2);

        expect(result).toEqual(account);
    });

    test("should get account by account number", async () => {
        const account = {
            _id: "account-id",
            accountNumber: "123456789012",
            balance: 0,
        };

        accountRepository.findByAccountNumber
            .mockResolvedValue(account);

        const result =
            await accountService.getAccountByNumber(
                "123456789012"
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
                "999999999999"
            )
        ).rejects.toMatchObject({
            message: "Account not found",
            statusCode: 404,
        });
    });

    test("should get accounts by user id", async () => {
        const accounts = [
            {
                _id: "account-1",
                userId: "user-id",
            },
            {
                _id: "account-2",
                userId: "user-id",
            },
        ];

        accountRepository.findByUserId
            .mockResolvedValue(accounts);

        const result =
            await accountService.getAccountsByUserId(
                "user-id"
            );

        expect(
            accountRepository.findByUserId
        ).toHaveBeenCalledWith("user-id");

        expect(result).toEqual(accounts);
    });
});