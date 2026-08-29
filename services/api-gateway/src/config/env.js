require("dotenv").config();

const env = {
    port:
        Number(process.env.PORT) || 3000,

    authServiceUrl:
        process.env.AUTH_SERVICE_URL,

    accountServiceUrl:
        process.env.ACCOUNT_SERVICE_URL,

    transactionServiceUrl:
        process.env.TRANSACTION_SERVICE_URL,
};

if (!env.authServiceUrl) {
    throw new Error(
        "AUTH_SERVICE_URL is required"
    );
}

if (!env.accountServiceUrl) {
    throw new Error(
        "ACCOUNT_SERVICE_URL is required"
    );
}

if (!env.transactionServiceUrl) {
    throw new Error(
        "TRANSACTION_SERVICE_URL is required"
    );
}

module.exports = env;