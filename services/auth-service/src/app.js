const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "auth-service",
    });
});

app.use("/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;