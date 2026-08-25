jest.mock("../src/services/account.service", () => ({
    createAccount: jest.fn(),
    getAccountByNumber: jest.fn(),
    getAccountsByUserId: jest.fn(),
}));

const accountService = require(
    "../src/services/account.service"
);

const accountController = require(
    "../src/controllers/account.controller"
);

describe("Account Controller", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: {
                id: "user-id-123",
                role: "customer",
            },
            params: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    describe("createAccount", () => {
        test("should create an account successfully", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-id-123",
                accountNumber: "123456789012",
                balance: 0,
                currency: "INR",
                status: "active",
            };

            accountService.createAccount
                .mockResolvedValue(account);

            await accountController.createAccount(
                req,
                res,
                next
            );

            expect(
                accountService.createAccount
            ).toHaveBeenCalledWith({
                userId: "user-id-123",
            });

            expect(
                res.status
            ).toHaveBeenCalledWith(201);

            expect(
                res.json
            ).toHaveBeenCalledWith({
                status: "success",
                data: {
                    account,
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass service error to next", async () => {
            const error = new Error(
                "Database error"
            );

            accountService.createAccount
                .mockRejectedValue(error);

            await accountController.createAccount(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                error
            );

            expect(
                res.status
            ).not.toHaveBeenCalled();
        });
    });

    describe("getAccount", () => {
        test("should return account successfully", async () => {
            const account = {
                _id: "account-id-123",
                userId: "user-id-123",
                accountNumber: "123456789012",
                balance: 5000,
                currency: "INR",
                status: "active",
            };

            req.params.accountNumber =
                "123456789012";

            accountService.getAccountByNumber
                .mockResolvedValue(account);

            await accountController.getAccount(
                req,
                res,
                next
            );

            expect(
                accountService.getAccountByNumber
            ).toHaveBeenCalledWith(
                "123456789012",
                "user-id-123"
            );

            expect(
                res.status
            ).toHaveBeenCalledWith(200);

            expect(
                res.json
            ).toHaveBeenCalledWith({
                status: "success",
                data: {
                    account,
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass service error to next", async () => {
            const error = new Error(
                "Account not found"
            );

            req.params.accountNumber =
                "123456789012";

            accountService.getAccountByNumber
                .mockRejectedValue(error);

            await accountController.getAccount(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                error
            );
        });
    });

    describe("getMyAccounts", () => {
        test("should return user's accounts", async () => {
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

            accountService.getAccountsByUserId
                .mockResolvedValue(accounts);

            await accountController.getMyAccounts(
                req,
                res,
                next
            );

            expect(
                accountService.getAccountsByUserId
            ).toHaveBeenCalledWith(
                "user-id-123"
            );

            expect(
                res.status
            ).toHaveBeenCalledWith(200);

            expect(
                res.json
            ).toHaveBeenCalledWith({
                status: "success",
                data: {
                    accounts,
                },
            });

            expect(next).not.toHaveBeenCalled();
        });

        test("should pass service error to next", async () => {
            const error = new Error(
                "Database error"
            );

            accountService.getAccountsByUserId
                .mockRejectedValue(error);

            await accountController.getMyAccounts(
                req,
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                error
            );
        });
    });
});