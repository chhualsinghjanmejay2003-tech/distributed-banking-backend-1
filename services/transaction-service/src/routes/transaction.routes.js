const express = require("express");

const transactionController = require(
    "../controllers/transaction.controller"
);

const router = express.Router();

router.post(
    "/",
    transactionController.createTransaction
);

router.get(
    "/account/:accountId",
    transactionController.getTransactionsByAccountId
);

router.get(
    "/:transactionId",
    transactionController.getTransactionById
);

module.exports = router;