const Account = require("../models/account.model");

const create = async (accountData) => {
    return Account.create(accountData);
};

const findByAccountNumber = async (
    accountNumber
) => {
    return Account.findOne({
        accountNumber,
    });
};

const findByUserId = async (userId) => {
    return Account.find({
        userId,
    });
};

const credit = async (
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
            ...(session && { session }),
        }
    );
};

const debit = async (
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
            ...(session && { session }),
        }
    );
};

module.exports = {
    create,
    findByAccountNumber,
    findByUserId,
    credit,
    debit,
};