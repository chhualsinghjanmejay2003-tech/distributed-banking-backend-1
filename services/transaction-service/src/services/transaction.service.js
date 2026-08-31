const crypto = require("crypto");

const transactionRepository = require(
    "../repositories/transaction.repository"
);

const accountClient = require(
    "../clients/account.client"
);

const {
    publishTransactionEvent,
} = require("../events/transaction.publisher");

const {
    publishTransactionEvent: publishKafkaEvent,
} = require("../events/transaction.kafka");


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
    sourceAccountNumber = null,
    destinationAccountNumber = null,
    amount,
    currency = "INR",
}) => {

    // ========================================
    // BASIC VALIDATION
    // ========================================

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


    // ========================================
    // IDEMPOTENCY
    // ========================================

    const existingTransaction =
        await transactionRepository.findByIdempotencyKey(
            idempotencyKey
        );


    if (existingTransaction) {
        return existingTransaction;
    }


    // ========================================
    // DEPOSIT VALIDATION
    // ========================================

    if (
        type === "deposit" &&
        !destinationAccountNumber
    ) {
        const error = new Error(
            "Destination account number is required for deposit"
        );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // WITHDRAWAL VALIDATION
    // ========================================

    if (
        type === "withdrawal" &&
        !sourceAccountNumber
    ) {
        const error = new Error(
            "Source account number is required for withdrawal"
        );

        error.statusCode = 400;

        throw error;
    }


    // ========================================
    // TRANSFER VALIDATION
    // ========================================

    if (type === "transfer") {

        if (!sourceAccountNumber) {
            const error = new Error(
                "Source account number is required for transfer"
            );

            error.statusCode = 400;

            throw error;
        }


        if (!destinationAccountNumber) {
            const error = new Error(
                "Destination account number is required for transfer"
            );

            error.statusCode = 400;

            throw error;
        }


        if (
            sourceAccountNumber ===
            destinationAccountNumber
        ) {
            const error = new Error(
                "Source and destination accounts must be different"
            );

            error.statusCode = 400;

            throw error;
        }
    }


    // ========================================
    // CREATE PENDING TRANSACTION
    // ========================================

    const transaction =
        await transactionRepository.create({
            transactionId:
                generateTransactionId(),

            idempotencyKey,

            type,

            sourceAccountNumber,

            destinationAccountNumber,

            amount,

            currency,

            status: "pending",
        });


    // ========================================
    // FINANCIAL OPERATION
    // ========================================

    try {

        if (type === "deposit") {

            await accountClient.creditAccount(
                destinationAccountNumber,
                amount
            );
        }


        if (type === "withdrawal") {

            await accountClient.debitAccount(
                sourceAccountNumber,
                amount
            );
        }


        if (type === "transfer") {

            await accountClient.transferAccounts(
                sourceAccountNumber,
                destinationAccountNumber,
                amount
            );
        }

    } catch (error) {

        await transactionRepository.updateStatus(
            transaction.transactionId,
            "failed"
        );

        throw error;
    }


    // ========================================
    // MARK COMPLETED
    // ========================================

    const completedTransaction =
        await transactionRepository.updateStatus(
            transaction.transactionId,
            "completed"
        );


    // ========================================
    // RABBITMQ EVENT
    // ========================================

    try {

        await publishTransactionEvent(
            "transaction.completed",
            completedTransaction
        );

    } catch (error) {

        console.error(
            "RabbitMQ event publishing failed:",
            error.message
        );
    }


    // ========================================
    // KAFKA EVENT
    // ========================================

    try {

        await publishKafkaEvent(
            "transaction.completed",
            completedTransaction
        );

    } catch (error) {

        console.error(
            "Kafka event publishing failed:",
            error.message
        );
    }


    return completedTransaction;
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
    accountNumber
) => {

    if (!accountNumber) {

        const error = new Error(
            "Account number is required"
        );

        error.statusCode = 400;

        throw error;
    }


    return transactionRepository.findByAccountId(
        accountNumber
    );
};


module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccountId,
};