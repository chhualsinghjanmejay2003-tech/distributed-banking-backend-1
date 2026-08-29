const express = require("express");

const proxyRoutes = require(
    "./routes/proxy.routes"
);

const app = express();

app.use(
    requestIdMiddleware
);

app.get(
    "/health",
    (req, res) => {
        res.status(200).json({
            success: true,
            service: "api-gateway",
        });
    }
);

app.use(proxyRoutes);

module.exports = app;