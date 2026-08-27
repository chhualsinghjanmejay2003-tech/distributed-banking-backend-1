const express = require("express");

const accountController = require(
    "../controllers/account.controller"
);

const authenticate = require(
    "../middleware/auth.middleware"
);

const internalAuth = require(
    "../middleware/internalAuth.middleware"
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

router.post(
    "/transfer",
    internalAuth,
    transferAccounts
);

router.get(
    "/:accountNumber",
    authenticate,
    accountController.getAccount
);

router.post(
    "/:accountNumber/credit",
    internalAuth,
    accountController.creditAccount
);

router.post(
    "/:accountNumber/debit",
    internalAuth,
    accountController.debitAccount
);

module.exports = router;