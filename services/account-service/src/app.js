const express = require("express");

const accountRoutes = require(
    "./routes/account.routes"
);

const requestIdMiddleware =
    require(
        "./middleware/request-id.middleware"
    );

const errorMiddleware =
    require(
        "./middleware/error.middleware"
    );

const {
    readiness,
    isReady,
} = require("./config/readiness");


const app = express();


app.use(express.json());

app.use(requestIdMiddleware);


/*
 * Liveness
 */
app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "account-service",
    });
});


/*
 * Readiness
 */
app.get("/ready", (req, res) => {
    if (!isReady()) {
        return res.status(503).json({
            status: "not ready",
            service: "account-service",
            dependencies: readiness,
        });
    }

    return res.status(200).json({
        status: "ready",
        service: "account-service",
        dependencies: readiness,
    });
});


app.use(
    "/accounts",
    accountRoutes
);


app.use(errorMiddleware);


module.exports = app;