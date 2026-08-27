const mongoose = require("mongoose");

const accountRepository = require(
    "../repositories/account.repository"
);

const generateAccountNumber = () => {
    const timestamp = Date.now()
        .toString()
        .slice(-8);

    const random = Math.floor(
        1000 + Math.random() * 9000
    );

    return `${timestamp}${random}`;
};

const createAccount = async ({ userId }) => {
    if (!userId) {
        const error = new Error(
            "User ID is required"
        );

        error.statusCode = 400;

        throw error;
    }

    let accountNumber;
    let existingAccount;

    do {
        accountNumber =
            generateAccountNumber();

        existingAccount =
            await accountRepository.findByAccountNumber(
                accountNumber
            );
    } while (existingAccount);

    const account =
        await accountRepository.create({
            userId,
            accountNumber,
            balance: 0,
            currency: "INR",
            status: "active",
        });

    return account;
};

const getAccountByNumber = async (
    accountNumber,
    userId
) => {
    const account =
        await accountRepository.findByAccountNumber(
            accountNumber
        );

    if (!account) {
        const error = new Error(
            "Account not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (
        account.userId.toString() !==
        userId.toString()
    ) {
        const error = new Error(
            "You are not authorized to access this account"
        );

        error.statusCode = 403;

        throw error;
    }

    return account;
};

const getAccountsByUserId = async (userId) => {
    return accountRepository.findByUserId(
        userId
    );
};

const creditAccount = async (
    accountNumber,
    amount
) => {
    const account =
        await accountRepository.creditAccount(
            accountNumber,
            amount
        );

    if (!account) {
        const error = new Error(
            "Account not found or inactive"
        );

        error.statusCode = 404;

        throw error;
    }

    return account;
};

const debitAccount = async (
    accountNumber,
    amount
) => {
    const account =
        await accountRepository.debitAccount(
            accountNumber,
            amount
        );

    if (!account) {
        const existingAccount =
            await accountRepository.findByAccountNumber(
                accountNumber
            );

        if (!existingAccount) {
            const error = new Error(
                "Account not found"
            );

            error.statusCode = 404;

            throw error;
        }

        if (
            existingAccount.status !==
            "active"
        ) {
            const error = new Error(
                "Account is inactive"
            );

            error.statusCode = 403;

            throw error;
        }

        const error = new Error(
            "Insufficient balance"
        );

        error.statusCode = 400;

        throw error;
    }

    return account;
};

/*
 * Atomically transfer money between
 * two accounts.
 *
 * Both operations happen inside the
 * same MongoDB transaction.
 */
const transferAccounts = async (
    sourceAccountNumber,
    destinationAccountNumber,
    amount
) => {
    if (
        !sourceAccountNumber ||
        !destinationAccountNumber
    ) {
        const error = new Error(
            "Source and destination accounts are required"
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

    const session =
        await mongoose.startSession();

    try {
        let sourceAccount;
        let destinationAccount;

        await session.withTransaction(
            async () => {
                /*
                 * Debit source account.
                 *
                 * The repository must use the
                 * supplied MongoDB session.
                 */
                sourceAccount =
                    await accountRepository.debitAccount(
                        sourceAccountNumber,
                        amount,
                        session
                    );

                if (!sourceAccount) {
                    const existingSourceAccount =
                        await accountRepository.findByAccountNumber(
                            sourceAccountNumber,
                            session
                        );

                    if (
                        !existingSourceAccount
                    ) {
                        const error =
                            new Error(
                                "Source account not found"
                            );

                        error.statusCode = 404;

                        throw error;
                    }

                    if (
                        existingSourceAccount.status !==
                        "active"
                    ) {
                        const error =
                            new Error(
                                "Source account is inactive"
                            );

                        error.statusCode = 403;

                        throw error;
                    }

                    const error =
                        new Error(
                            "Insufficient balance"
                        );

                    error.statusCode = 400;

                    throw error;
                }

                /*
                 * Credit destination account.
                 */
                destinationAccount =
                    await accountRepository.creditAccount(
                        destinationAccountNumber,
                        amount,
                        session
                    );

                if (!destinationAccount) {
                    const error =
                        new Error(
                            "Destination account not found or inactive"
                        );

                    error.statusCode = 404;

                    throw error;
                }
            }
        );

        return {
            sourceAccount,
            destinationAccount,
        };
    } finally {
        await session.endSession();
    }
};

module.exports = {
    createAccount,
    getAccountByNumber,
    getAccountsByUserId,
    creditAccount,
    debitAccount,
    transferAccounts,
};