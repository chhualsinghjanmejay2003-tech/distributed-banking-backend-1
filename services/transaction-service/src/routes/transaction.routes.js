const express = require("express");

const transactionController = require(
    "../controllers/transaction.controller"
);

const router = express.Router();


// ========================================
// CREATE TRANSACTION
// ========================================

router.post(
    "/",
    transactionController.createTransaction
);


// ========================================
// GET TRANSACTIONS BY ACCOUNT NUMBER
// ========================================

router.get(
    "/account/:accountNumber",
    transactionController.getTransactionsByAccountId
);


// ========================================
// GET TRANSACTION BY ID
// ========================================

router.get(
    "/:transactionId",
    transactionController.getTransactionById
);


module.exports = router;