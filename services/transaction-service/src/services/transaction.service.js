const crypto = require("crypto");

const transactionRepository = require(
    "../repositories/transaction.repository"
);

const accountClient = require(
    "../clients/account.client"
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
    // --------------------------------
    // Basic validation
    // --------------------------------

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

    // --------------------------------
    // Idempotency check
    // --------------------------------

    const existingTransaction =
        await transactionRepository.findByIdempotencyKey(
            idempotencyKey
        );

    if (existingTransaction) {
        return existingTransaction;
    }

    // --------------------------------
    // Deposit validation
    // --------------------------------

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

    // --------------------------------
    // Withdrawal validation
    // --------------------------------

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

    // --------------------------------
    // Transfer validation
    // --------------------------------

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

    // --------------------------------
    // Create pending transaction
    // --------------------------------

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

    // --------------------------------
    // Execute account operation
    // --------------------------------

    try {
        // Deposit
        if (type === "deposit") {
            await accountClient.creditAccount(
                destinationAccountId,
                amount
            );
        }

        // Withdrawal
        if (type === "withdrawal") {
            await accountClient.debitAccount(
                sourceAccountId,
                amount
            );
        }

        // Transfer
        if (type === "transfer") {
            await accountClient.transferAccounts(
                sourceAccountId,
                destinationAccountId,
                amount
            );
        }

        // --------------------------------
        // Mark transaction completed
        // --------------------------------

        const completedTransaction =
            await transactionRepository.updateStatus(
                transaction.transactionId,
                "completed"
            );

        return completedTransaction;
    } catch (error) {
        // --------------------------------
        // Mark transaction failed
        // --------------------------------

        await transactionRepository.updateStatus(
            transaction.transactionId,
            "failed"
        );

        throw error;
    }
};

const getTransactionById = async (
    transactionId
) => {
    const transaction =
        await transactionRepository.findByTransactionId(
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

    return transactionRepository.findByAccountId(
        accountId
    );
};

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccountId,
};