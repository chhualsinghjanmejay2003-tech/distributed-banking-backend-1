const express = require("express");

const accountController = require(
    "../controllers/account.controller"
);

const authenticate = require(
    "../middleware/auth.middleware"
);

const router = express.Router();

router.post(
    "/",
    authenticate,
    accountController.createAccount
);

router.get(
    "/",
    authenticate,
    accountController.getMyAccounts
);

router.get(
    "/:accountNumber",
    authenticate,
    accountController.getAccount
);

router.post(
    "/:accountNumber/credit",
    creditAccount
);

router.post(
    "/:accountNumber/debit",
    debitAccount
);

module.exports = router;