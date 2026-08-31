const swaggerDocument = {
    openapi: "3.0.3",

    info: {
        title: "Distributed Banking API",
        version: "1.0.0",
        description:
            "API Gateway documentation for the distributed banking backend",
    },

    servers: [
        {
            url: "http://localhost:3000",
            description: "Local API Gateway",
        },
    ],

    tags: [
        {
            name: "Health",
            description: "Gateway health endpoints",
        },

        {
            name: "Auth",
            description: "Authentication endpoints",
        },

        {
            name: "Accounts",
            description: "Bank account endpoints",
        },

        {
            name: "Transactions",
            description: "Transaction endpoints",
        },
    ],

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },

        schemas: {
            RegisterRequest: {
                type: "object",

                required: [
                    "name",
                    "email",
                    "password",
                ],

                properties: {
                    name: {
                        type: "string",
                        example: "Janmejay Singh",
                    },

                    email: {
                        type: "string",
                        format: "email",
                        example:
                            "janmejay@example.com",
                    },

                    password: {
                        type: "string",
                        format: "password",
                        example:
                            "Password123!",
                    },
                },
            },

            LoginRequest: {
                type: "object",

                required: [
                    "email",
                    "password",
                ],

                properties: {
                    email: {
                        type: "string",
                        format: "email",
                        example:
                            "janmejay@example.com",
                    },

                    password: {
                        type: "string",
                        format: "password",
                        example:
                            "Password123!",
                    },
                },
            },

            RefreshRequest: {
                type: "object",

                required: [
                    "refreshToken",
                ],

                properties: {
                    refreshToken: {
                        type: "string",
                        example:
                            "your-refresh-token",
                    },
                },
            },

            TransactionRequest: {
                type: "object",

                required: [
                    "idempotencyKey",
                    "type",
                    "amount",
                ],

                properties: {
                    idempotencyKey: {
                        type: "string",
                        example:
                            "transfer-12345",
                    },

                    type: {
                        type: "string",

                        enum: [
                            "deposit",
                            "withdrawal",
                            "transfer",
                        ],

                        example: "transfer",
                    },

                    sourceAccountId: {
                        type: "string",
                        example:
                            "123456789012",
                    },

                    destinationAccountId: {
                        type: "string",
                        example:
                            "987654321098",
                    },

                    amount: {
                        type: "number",
                        minimum: 0.01,
                        example: 1000,
                    },

                    currency: {
                        type: "string",
                        example: "INR",
                    },
                },
            },
        },
    },

    paths: {

        // =========================================
        // HEALTH
        // =========================================

        "/health": {
            get: {
                tags: ["Health"],

                summary:
                    "Check API Gateway health",

                responses: {
                    200: {
                        description:
                            "Gateway is healthy",
                    },
                },
            },
        },


        // =========================================
        // AUTH
        // =========================================

        "/auth/register": {
            post: {
                tags: ["Auth"],

                summary:
                    "Register a new user",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/RegisterRequest",
                            },
                        },
                    },
                },

                responses: {
                    201: {
                        description:
                            "User registered successfully",
                    },

                    400: {
                        description:
                            "Validation failed",
                    },
                },
            },
        },


        "/auth/login": {
            post: {
                tags: ["Auth"],

                summary:
                    "Login and receive JWT tokens",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/LoginRequest",
                            },
                        },
                    },
                },

                responses: {
                    200: {
                        description:
                            "Login successful",
                    },

                    400: {
                        description:
                            "Validation failed",
                    },

                    401: {
                        description:
                            "Invalid credentials",
                    },
                },
            },
        },


        "/auth/refresh": {
            post: {
                tags: ["Auth"],

                summary:
                    "Refresh an access token",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/RefreshRequest",
                            },
                        },
                    },
                },

                responses: {
                    200: {
                        description:
                            "Access token refreshed successfully",
                    },

                    400: {
                        description:
                            "Validation failed",
                    },

                    401: {
                        description:
                            "Invalid or expired refresh token",
                    },
                },
            },
        },


        // =========================================
        // ACCOUNTS
        // =========================================

        "/accounts": {
            get: {
                tags: ["Accounts"],

                summary:
                    "Get all accounts belonging to the authenticated user",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                responses: {
                    200: {
                        description:
                            "Accounts returned successfully",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },
                },
            },

            post: {
                tags: ["Accounts"],

                summary:
                    "Create a new bank account",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                responses: {
                    201: {
                        description:
                            "Account created successfully",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },
                },
            },
        },


        "/accounts/{accountNumber}": {
            get: {
                tags: ["Accounts"],

                summary:
                    "Get a specific bank account",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        name: "accountNumber",

                        in: "path",

                        required: true,

                        schema: {
                            type: "string",
                        },

                        example:
                            "123456789012",
                    },
                ],

                responses: {
                    200: {
                        description:
                            "Account returned successfully",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },

                    404: {
                        description:
                            "Account not found",
                    },
                },
            },
        },


        // =========================================
        // TRANSACTIONS
        // =========================================

        "/transactions": {
            post: {
                tags: ["Transactions"],

                summary:
                    "Create a deposit, withdrawal, or transfer",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                $ref:
                                    "#/components/schemas/TransactionRequest",
                            },
                        },
                    },
                },

                responses: {
                    201: {
                        description:
                            "Transaction created successfully",
                    },

                    400: {
                        description:
                            "Invalid transaction",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },
                },
            },
        },


        "/transactions/account/{accountId}": {
            get: {
                tags: ["Transactions"],

                summary:
                    "Get transactions for an account",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        name: "accountId",

                        in: "path",

                        required: true,

                        schema: {
                            type: "string",
                        },

                        example:
                            "123456789012",
                    },
                ],

                responses: {
                    200: {
                        description:
                            "Transactions returned successfully",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },

                    404: {
                        description:
                            "Account not found",
                    },
                },
            },
        },


        "/transactions/{transactionId}": {
            get: {
                tags: ["Transactions"],

                summary:
                    "Get a transaction by transaction ID",

                security: [
                    {
                        bearerAuth: [],
                    },
                ],

                parameters: [
                    {
                        name: "transactionId",

                        in: "path",

                        required: true,

                        schema: {
                            type: "string",
                        },

                        example:
                            "txn-123456789",
                    },
                ],

                responses: {
                    200: {
                        description:
                            "Transaction returned successfully",
                    },

                    401: {
                        description:
                            "Authentication required",
                    },

                    404: {
                        description:
                            "Transaction not found",
                    },
                },
            },
        },
    },
};

module.exports = swaggerDocument;