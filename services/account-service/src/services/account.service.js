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

        if (existingAccount.status !== "active") {
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

module.exports = {
    createAccount,
    getAccountByNumber,
    getAccountsByUserId,
    creditAccount,
    debitAccount,
};