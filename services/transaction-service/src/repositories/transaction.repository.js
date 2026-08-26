const Transaction = require(
    "../models/transaction.model"
);

const create = async (transactionData) => {
    return Transaction.create(
        transactionData
    );
};

const findByTransactionId = async (
    transactionId
) => {
    return Transaction.findOne({
        transactionId,
    });
};

const findByIdempotencyKey = async (
    idempotencyKey
) => {
    return Transaction.findOne({
        idempotencyKey,
    });
};

const findByAccountId = async (
    accountId
) => {
    return Transaction.find({
        $or: [
            {
                sourceAccountId: accountId,
            },
            {
                destinationAccountId: accountId,
            },
        ],
    }).sort({
        createdAt: -1,
    });
};

const updateStatus = async (
    transactionId,
    status
) => {
    return Transaction.findOneAndUpdate(
        { transactionId },
        { status },
        {
            new: true,
        }
    );
};

module.exports = {
    create,
    findByTransactionId,
    findByIdempotencyKey,
    findByAccountId,
    updateStatus,
};