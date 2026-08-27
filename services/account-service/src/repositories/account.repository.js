const Account = require(
    "../models/account.model"
);

const create = async (accountData) => {
    return Account.create(accountData);
};

const findByAccountNumber = async (
    accountNumber,
    session = null
) => {
    return Account.findOne(
        { accountNumber },
        null,
        session
            ? { session }
            : undefined
    );
};

const findByUserId = async (userId) => {
    return Account.find({
        userId,
    });
};

const creditAccount = async (
    accountNumber,
    amount,
    session = null
) => {
    return Account.findOneAndUpdate(
        {
            accountNumber,
            status: "active",
        },
        {
            $inc: {
                balance: amount,
            },
        },
        {
            new: true,
            ...(session && {
                session,
            }),
        }
    );
};

const debitAccount = async (
    accountNumber,
    amount,
    session = null
) => {
    return Account.findOneAndUpdate(
        {
            accountNumber,
            status: "active",
            balance: {
                $gte: amount,
            },
        },
        {
            $inc: {
                balance: -amount,
            },
        },
        {
            new: true,
            ...(session && {
                session,
            }),
        }
    );
};

module.exports = {
    create,
    findByAccountNumber,
    findByUserId,
    creditAccount,
    debitAccount,
};