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

const getAccount = async (req, res, next) => {
    try {
        const account =
            await accountService.getAccountByNumber(
                req.params.accountNumber
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

const getMyAccounts = async (req, res, next) => {
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

module.exports = {
    createAccount,
    getAccount,
    getMyAccounts,
};