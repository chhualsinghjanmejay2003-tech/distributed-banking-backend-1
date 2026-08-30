const express = require("express");

const transactionRoutes = require(
    "./routes/transaction.routes"
);

const requestIdMiddleware = require(
    "./middleware/request-id.middleware"
);

const errorMiddleware = require(
    "./middleware/error.middleware"
);

const {
    readiness,
    isReady,
} = require("./config/readiness");

const app = express();


// -------------------------
// Global Middleware
// -------------------------

app.use(express.json());

app.use(requestIdMiddleware);


// -------------------------
// Health Check
// -------------------------

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "success",
        message: "Transaction Service is healthy",
    });
});


// -------------------------
// Readiness Check
// -------------------------

app.get("/ready", (req, res) => {
    if (!isReady()) {
        return res.status(503).json({
            status: "error",
            message: "Transaction Service is not ready",
            dependencies: readiness,
        });
    }

    return res.status(200).json({
        status: "success",
        message: "Transaction Service is ready",
        dependencies: readiness,
    });
});


// -------------------------
// Transaction Routes
// -------------------------

app.use(
    "/transactions",
    transactionRoutes
);


// -------------------------
// 404 - Route Not Found
// -------------------------

app.use((req, res) => {
    return res.status(404).json({
        status: "error",
        message: "Route not found",
    });
});


// -------------------------
// Global Error Handler
// -------------------------

app.use(errorMiddleware);


module.exports = app;