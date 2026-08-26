const Account = require("../models/account.model");

const create = async (accountData) => {
    return Account.create(accountData);
};

const findByAccountNumber = async (accountNumber) => {
    return Account.findOne({
        accountNumber,
    });
};

const findByUserId = async (userId) => {
    return Account.find({
        userId,
    });
};

const creditAccount = async (
    accountNumber,
    amount
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
        }
    );
};

const debitAccount = async (
    accountNumber,
    amount
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