jest.mock("axios", () => ({
    create: jest.fn(),
}));

jest.mock("../src/config/env", () => ({
    accountServiceUrl:
        "http://localhost:3002",

    internalApiKey:
        "test-internal-key",
}));

const axios = require("axios");

const mockPost = jest.fn();

axios.create.mockReturnValue({
    post: mockPost,
});

const accountClient = require(
    "../src/clients/account.client"
);

describe("Account Client", () => {
    beforeEach(() => {
        mockPost.mockReset();
    });

    test("should credit an account", async () => {
        mockPost.mockResolvedValue({
            data: {
                data: {
                    account: {
                        accountNumber: "ACC001",
                        balance: 5000,
                    },
                },
            },
        });

        const result =
            await accountClient.creditAccount(
                "ACC001",
                5000
            );

        expect(mockPost).toHaveBeenCalledWith(
            "/accounts/ACC001/credit",
            {
                amount: 5000,
            }
        );

        expect(result).toEqual({
            accountNumber: "ACC001",
            balance: 5000,
        });
    });

    test("should debit an account", async () => {
        mockPost.mockResolvedValue({
            data: {
                data: {
                    account: {
                        accountNumber: "ACC001",
                        balance: 3000,
                    },
                },
            },
        });

        const result =
            await accountClient.debitAccount(
                "ACC001",
                2000
            );

        expect(mockPost).toHaveBeenCalledWith(
            "/accounts/ACC001/debit",
            {
                amount: 2000,
            }
        );

        expect(result).toEqual({
            accountNumber: "ACC001",
            balance: 3000,
        });
    });

    test("should propagate Account Service errors", async () => {
        mockPost.mockRejectedValue(
            new Error("Account not found")
        );

        await expect(
            accountClient.debitAccount(
                "ACC001",
                2000
            )
        ).rejects.toThrow(
            "Account not found"
        );

        expect(mockPost).toHaveBeenCalledWith(
            "/accounts/ACC001/debit",
            {
                amount: 2000,
            }
        );
    });
});