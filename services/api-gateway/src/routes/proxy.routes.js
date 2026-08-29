const express = require("express");

const {
    createProxyMiddleware,
} = require(
    "http-proxy-middleware"
);

const env = require(
    "../config/env"
);

const router = express.Router();

router.use(
    "/auth",
    createProxyMiddleware({
        target: env.authServiceUrl,
        changeOrigin: true,
    })
);

router.use(
    "/accounts",
    createProxyMiddleware({
        target: env.accountServiceUrl,
        changeOrigin: true,
    })
);

router.use(
    "/transactions",
    createProxyMiddleware({
        target: env.transactionServiceUrl,
        changeOrigin: true,
    })
);

module.exports = router;