const express = require("express");

const errorHandler = require(
    "./middleware/errorHandler"
);

const notFound = require(
    "./middleware/notFound"
);

const authRoutes = require(
    "./routes/auth.routes"
);

const {
    readiness,
    isReady,
} = require("./config/readiness");


const app = express();


app.use(
    express.json({
        limit: "10kb",
    })
);


/*
 * Liveness endpoint
 *
 * This only tells us that the
 * Node.js process is alive.
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "auth-service",
    });
});


/*
 * Readiness endpoint
 *
 * This tells us whether all required
 * infrastructure dependencies have
 * successfully connected.
 */
app.get("/ready", (req, res) => {
    if (!isReady()) {
        return res.status(503).json({
            status: "not ready",
            service: "auth-service",
            dependencies: readiness,
        });
    }

    return res.status(200).json({
        status: "ready",
        service: "auth-service",
        dependencies: readiness,
    });
});


app.use(
    "/auth",
    authRoutes
);


app.use(notFound);

app.use(errorHandler);


module.exports = app;