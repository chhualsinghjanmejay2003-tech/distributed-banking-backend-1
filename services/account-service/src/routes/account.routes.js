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

module.exports = router;