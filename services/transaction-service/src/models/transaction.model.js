const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        idempotencyKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "deposit",
                "withdrawal",
                "transfer",
            ],
            required: true,
        },

        sourceAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            default: null,
        },

        destinationAccountId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            default: null,
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },

        currency: {
            type: String,
            required: true,
            default: "INR",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "completed",
                "failed",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Transaction",
    transactionSchema
);