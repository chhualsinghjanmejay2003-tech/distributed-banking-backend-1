const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const swaggerUi = require(
    "swagger-ui-express"
);

const swaggerDocument = require(
    "./config/swagger"
);

const proxyRoutes = require(
    "./routes/proxy.routes"
);

const requestIdMiddleware =
    require(
        "./middleware/request-id.middleware"
    );


const app = express();


// -------------------------
// Security
// -------------------------

app.use(
    helmet()
);


// -------------------------
// Request Body
// -------------------------

app.use(
    express.json({
        limit: "10kb",
    })
);


// -------------------------
// CORS
// -------------------------

app.use(
    cors({
        origin:
            process.env.CORS_ORIGIN ||
            "http://localhost:3000",

        credentials: true,
    })
);


// -------------------------
// Request ID / Correlation ID
// -------------------------

app.use(
    requestIdMiddleware
);


// -------------------------
// Liveness
// -------------------------

app.get(
    "/health",
    (req, res) => {

        return res.status(200).json({
            success: true,

            service:
                "api-gateway",

            requestId:
                req.requestId,
        });
    }
);


// -------------------------
// Readiness
// -------------------------

app.get(
    "/ready",
    (req, res) => {

        return res.status(200).json({
            success: true,

            status: "ready",

            service:
                "api-gateway",

            requestId:
                req.requestId,
        });
    }
);


// -------------------------
// Swagger / OpenAPI
// -------------------------

app.use(
    "/docs",

    swaggerUi.serve,

    swaggerUi.setup(
        swaggerDocument
    )
);


// -------------------------
// Microservice Proxy Routes
// -------------------------

app.use(
    proxyRoutes
);


module.exports = app;