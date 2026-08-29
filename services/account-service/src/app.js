const express = require("express");

const accountRoutes = require(
    "./routes/account.routes"
);

const requestIdMiddleware =
    require(
        "./middleware/request-id.middleware"
    );

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "account-service",
    });
});

app.use("/accounts", accountRoutes);

module.exports = app;