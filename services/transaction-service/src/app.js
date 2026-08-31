const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const requestIdMiddleware = require(
    "./middleware/request-id.middleware"
);

const transactionRoutes = require(
    "./routes/transaction.routes"
);

const {
    readiness,
    isReady,
} = require("./config/readiness");


const app = express();


// ========================================
// SECURITY HEADERS
// ========================================

app.use(
    helmet()
);


// ========================================
// CORS
// ========================================

app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN ||
            "http://localhost:3000",

        credentials: true,
    })
);


// ========================================
// REQUEST BODY
// ========================================

app.use(
    express.json({
        limit: "10kb",
    })
);


// ========================================
// REQUEST ID
// ========================================

app.use(
    requestIdMiddleware
);


// ========================================
// HEALTH CHECK
// ========================================

app.get(
    "/health",
    (req, res) => {
        return res.status(200).json({
            success: true,
            service: "transaction-service",
            requestId: req.requestId,
        });
    }
);


// ========================================
// READINESS CHECK
// ========================================

app.get(
    "/ready",
    (req, res) => {

        if (!isReady()) {
            return res.status(503).json({
                success: false,
                status: "not_ready",
                service: "transaction-service",
                readiness,
                requestId: req.requestId,
            });
        }

        return res.status(200).json({
            success: true,
            status: "ready",
            service: "transaction-service",
            readiness,
            requestId: req.requestId,
        });
    }
);


// ========================================
// TRANSACTION ROUTES
// ========================================

app.use(
    "/transactions",
    transactionRoutes
);


// ========================================
// 404 HANDLER
// ========================================

app.use(
    (req, res) => {
        return res.status(404).json({
            success: false,
            message: "Route not found",
            requestId: req.requestId,
        });
    }
);


module.exports = app;