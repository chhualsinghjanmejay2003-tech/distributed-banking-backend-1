const express = require("express");

const transactionRoutes = require(
    "./routes/transaction.routes"
);

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Transaction Service is healthy",
    });
});

app.use(
    "/transactions",
    transactionRoutes
);

app.use((req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

app.use((error, req, res, next) => {
    console.error(error);

    return res.status(
        error.statusCode || 500
    ).json({
        status: "error",
        message:
            error.message ||
            "Internal server error",
    });
});

module.exports = app;