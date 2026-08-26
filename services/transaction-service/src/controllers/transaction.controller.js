const transactionService = require(
    "../services/transaction.service"
);

const createTransaction = async (
    req,
    res,
    next
) => {
    try {
        const transaction =
            await transactionService.createTransaction(
                req.body
            );

        return res.status(201).json({
            status: "success",
            data: {
                transaction,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getTransactionById = async (
    req,
    res,
    next
) => {
    try {
        const transaction =
            await transactionService.getTransactionById(
                req.params.transactionId
            );

        return res.status(200).json({
            status: "success",
            data: {
                transaction,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getTransactionsByAccountId = async (
    req,
    res,
    next
) => {
    try {
        const transactions =
            await transactionService.getTransactionsByAccountId(
                req.params.accountId
            );

        return res.status(200).json({
            status: "success",
            data: {
                transactions,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccountId,
};