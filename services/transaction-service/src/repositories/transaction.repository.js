const Transaction = require(
    "../models/transaction.model"
);


const create = async (data) => {
    return Transaction.create(data);
};


const findByIdempotencyKey = async (
    idempotencyKey
) => {
    return Transaction.findOne({
        idempotencyKey,
    });
};


const findByTransactionId = async (
    transactionId
) => {
    return Transaction.findOne({
        transactionId,
    });
};


const findByAccountId = async (
    accountNumber
) => {
    return Transaction.find({
        $or: [
            {
                sourceAccountNumber:
                    accountNumber,
            },
            {
                destinationAccountNumber:
                    accountNumber,
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
        {
            transactionId,
        },
        {
            status,
        },
        {
            new: true,
        }
    );
};


module.exports = {
    create,
    findByIdempotencyKey,
    findByTransactionId,
    findByAccountId,
    updateStatus,
};