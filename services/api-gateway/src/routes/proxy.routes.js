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

const createServiceProxy = (
    target
) =>
    createProxyMiddleware({
        target,
        changeOrigin: true,

        on: {
            proxyReq: (
                proxyReq,
                req
            ) => {
                if (req.requestId) {
                    proxyReq.setHeader(
                        "x-request-id",
                        req.requestId
                    );
                }
            },
        },
    });

router.use(
    "/auth",
    createServiceProxy(
        env.authServiceUrl
    )
);

router.use(
    "/accounts",
    createServiceProxy(
        env.accountServiceUrl
    )
);

router.use(
    "/transactions",
    createServiceProxy(
        env.transactionServiceUrl
    )
);

module.exports = router;