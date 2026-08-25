const authorize = require(
    "../src/middleware/role.middleware"
);

describe("Role Authorization Middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {};

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    test("should reject unauthenticated request", () => {
        const middleware = authorize("admin");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(next).not.toHaveBeenCalled();
    });

    test("should allow user with required role", () => {
        req.user = {
            userId: "user-id",
            role: "admin",
        };

        const middleware = authorize("admin");

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test("should reject user without required role", () => {
        req.user = {
            userId: "user-id",
            role: "customer",
        };

        const middleware = authorize("admin");

        middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Insufficient permissions",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should allow any of multiple permitted roles", () => {
        req.user = {
            userId: "user-id",
            role: "employee",
        };

        const middleware = authorize(
            "admin",
            "employee"
        );

        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});