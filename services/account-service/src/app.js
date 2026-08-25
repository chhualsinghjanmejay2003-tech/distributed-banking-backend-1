const express = require("express");

const accountRoutes = require(
    "./routes/account.routes"
);

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "account-service",
    });
});

app.use("/accounts", accountRoutes);

module.exports = app;