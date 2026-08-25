const express = require("express");

const accountController = require(
    "../controllers/account.controller"
);

const router = express.Router();

router.post(
    "/",
    accountController.createAccount
);

router.get(
    "/",
    accountController.getMyAccounts
);

router.get(
    "/:accountNumber",
    accountController.getAccount
);

module.exports = router;