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

module.exports = {
    create,
    findByAccountNumber,
    findByUserId,
};