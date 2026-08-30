const axios = require("axios");

const env = require("../config/env");

 const accountClient = axios.create({
    baseURL: env.accountServiceUrl,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        "x-internal-api-key":
            env.internalApiKey,
    },
});

const creditAccount = async (
    accountNumber,
    amount
) => {
    const response =
        await accountClient.post(
            `/accounts/${accountNumber}/credit`,
            {
                amount,
            }
        );

    return response.data.data.account;
};

const debitAccount = async (
    accountNumber,
    amount
) => {
    const response =
        await accountClient.post(
            `/accounts/${accountNumber}/debit`,
            {
                amount,
            }
        );

    return response.data.data.account;
};

const transferAccounts = async (
    sourceAccountNumber,
    destinationAccountNumber,
    amount
) => {
    const response =
        await accountClient.post(
            "/accounts/transfer",
            {
                sourceAccountNumber,
                destinationAccountNumber,
                amount,
            }
        );

    return response.data.data;
};

module.exports = {
    creditAccount,
    debitAccount,
    transferAccounts,
};