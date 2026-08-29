const express = require("express");

const swaggerUi = require("swagger-ui-express");

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

// Request ID / correlation ID
app.use(
    requestIdMiddleware
);

// Health check
app.get(
    "/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            service: "api-gateway",
            requestId: req.requestId,
        });
    }
);

// Swagger / OpenAPI documentation
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(
        swaggerDocument
    )
);

// Microservice proxy routes
app.use(proxyRoutes);

module.exports = app;