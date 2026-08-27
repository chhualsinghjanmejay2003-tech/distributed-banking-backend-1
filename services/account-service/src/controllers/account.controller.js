const accountService = require(
    "../services/account.service"
);

const createAccount = async (req, res, next) => {
    try {
        const account =
            await accountService.createAccount({
                userId: req.user.id,
            });

        return res.status(201).json({
            status: "success",
            data: {
                account,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getAccountByNumber = async (
    req,
    res,
    next
) => {
    try {
        const account =
            await accountService.getAccountByNumber(
                req.params.accountNumber,
                req.user.id
            );

        return res.status(200).json({
            status: "success",
            data: {
                account,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getAccountsByUserId = async (
    req,
    res,
    next
) => {
    try {
        const accounts =
            await accountService.getAccountsByUserId(
                req.user.id
            );

        return res.status(200).json({
            status: "success",
            data: {
                accounts,
            },
        });
    } catch (error) {
        next(error);
    }
};

const creditAccount = async (
    req,
    res,
    next
) => {
    try {
        const account =
            await accountService.creditAccount(
                req.params.accountNumber,
                req.body.amount
            );

        return res.status(200).json({
            status: "success",
            data: {
                account,
            },
        });
    } catch (error) {
        next(error);
    }
};

const debitAccount = async (
    req,
    res,
    next
) => {
    try {
        const account =
            await accountService.debitAccount(
                req.params.accountNumber,
                req.body.amount
            );

        return res.status(200).json({
            status: "success",
            data: {
                account,
            },
        });
    } catch (error) {
        next(error);
    }
};

const transferAccounts = async (
    req,
    res,
    next
) => {
    try {
        const {
            sourceAccountNumber,
            destinationAccountNumber,
            amount,
        } = req.body;

        const result =
            await accountService.transferAccounts(
                sourceAccountNumber,
                destinationAccountNumber,
                amount
            );

        return res.status(200).json({
            status: "success",
            data: result,
        });
    } catch (error) {
        next(error);
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