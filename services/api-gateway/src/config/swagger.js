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

    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Check API Gateway health",

                responses: {
                    200: {
                        description:
                            "Gateway is healthy",
                    },
                },
            },
        },

        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Register a user",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                type: "object",

                                properties: {
                                    email: {
                                        type: "string",
                                        example:
                                            "user@example.com",
                                    },

                                    password: {
                                        type: "string",
                                        example:
                                            "Password123!",
                                    },
                                },

                                required: [
                                    "email",
                                    "password",
                                ],
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
                            "Invalid request",
                    },
                },
            },
        },

        "/accounts": {
            get: {
                tags: ["Accounts"],
                summary: "Get accounts for the authenticated user",

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
                summary: "Create a bank account",

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

        "/transactions": {
            post: {
                tags: ["Transactions"],
                summary: "Create a transaction",

                requestBody: {
                    required: true,

                    content: {
                        "application/json": {
                            schema: {
                                type: "object",

                                properties: {
                                    type: {
                                        type: "string",
                                        enum: [
                                            "deposit",
                                            "withdrawal",
                                            "transfer",
                                        ],
                                    },

                                    sourceAccountId: {
                                        type: "string",
                                    },

                                    destinationAccountId: {
                                        type: "string",
                                    },

                                    amount: {
                                        type: "number",
                                        example: 1000,
                                    },

                                    currency: {
                                        type: "string",
                                        example: "INR",
                                    },
                                },

                                required: [
                                    "type",
                                    "amount",
                                ],
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
    },
};

module.exports = swaggerDocument;