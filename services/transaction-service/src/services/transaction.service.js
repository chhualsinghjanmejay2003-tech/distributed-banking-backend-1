const crypto = require("crypto");

const transactionRepository = require(
    "../repositories/transaction.repository"
);

const generateTransactionId = () => {
    return `txn-${crypto.randomUUID()}`;
};

const validateAmount = (amount) => {
    if (
        typeof amount !== "number" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        const error = new Error(
            "Amount must be greater than zero"
        );

        error.statusCode = 400;

        throw error;
    }
};

const createTransaction = async ({
    idempotencyKey,
    type,
    sourceAccountId = null,
    destinationAccountId = null,
    amount,
    currency = "INR",
}) => {
    if (!idempotencyKey) {
        const error = new Error(
            "Idempotency key is required"
        );

        error.statusCode = 400;

        throw error;
    }

    if (!type) {
        const error = new Error(
            "Transaction type is required"
        );

        error.statusCode = 400;

        throw error;
    }

    const validTypes = [
        "deposit",
        "withdrawal",
        "transfer",
    ];

    if (!validTypes.includes(type)) {
        const error = new Error(
            "Invalid transaction type"
        );

        error.statusCode = 400;

        throw error;
    }

    validateAmount(amount);

    const existingTransaction =
        await transactionRepository
            .findByIdempotencyKey(
                idempotencyKey
            );

    if (existingTransaction) {
        return existingTransaction;
    }

    if (
        type === "deposit" &&
        !destinationAccountId
    ) {
        const error = new Error(
            "Destination account is required for deposit"
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        type === "withdrawal" &&
        !sourceAccountId
    ) {
        const error = new Error(
            "Source account is required for withdrawal"
        );

        error.statusCode = 400;

        throw error;
    }

    if (type === "transfer") {
        if (!sourceAccountId) {
            const error = new Error(
                "Source account is required for transfer"
            );

            error.statusCode = 400;

            throw error;
        }

        if (!destinationAccountId) {
            const error = new Error(
                "Destination account is required for transfer"
            );

            error.statusCode = 400;

            throw error;
        }

        if (
            sourceAccountId ===
            destinationAccountId
        ) {
            const error = new Error(
                "Source and destination accounts must be different"
            );

            error.statusCode = 400;

            throw error;
        }
    }

    const transaction =
        await transactionRepository.create({
            transactionId:
                generateTransactionId(),

            idempotencyKey,

            type,

            sourceAccountId,

            destinationAccountId,

            amount,

            currency,

            status: "pending",
        });

    return transaction;
};

const getTransactionById = async (
    transactionId
) => {
    const transaction =
        await transactionRepository
            .findByTransactionId(
                transactionId
            );

    if (!transaction) {
        const error = new Error(
            "Transaction not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return transaction;
};

const getTransactionsByAccountId = async (
    accountId
) => {
    if (!accountId) {
        const error = new Error(
            "Account ID is required"
        );

        error.statusCode = 400;

        throw error;
    }

    return transactionRepository
        .findByAccountId(accountId);
};

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccountId,
};