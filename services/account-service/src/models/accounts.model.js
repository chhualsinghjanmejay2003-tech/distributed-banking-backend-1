const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        accountNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        balance: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        currency: {
            type: String,
            required: true,
            default: "INR",
            enum: ["INR"],
        },

        status: {
            type: String,
            required: true,
            default: "active",
            enum: [
                "active",
                "frozen",
                "closed",
            ],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "Account",
    accountSchema
);