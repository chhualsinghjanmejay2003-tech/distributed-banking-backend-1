jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const authenticate = require(
    "../src/middleware/auth.middleware"
);

describe("Authentication Middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    test("should reject when authorization header is missing", () => {
        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Authorization header is required",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should reject invalid authorization format", () => {
        req.headers.authorization = "Invalid token";

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(next).not.toHaveBeenCalled();
    });

    test("should authenticate valid access token", () => {
        req.headers.authorization =
            "Bearer valid-access-token";

        jwt.verify.mockReturnValue({
            userId: "user-id-123",
            role: "customer",
        });

        authenticate(req, res, next);

        expect(jwt.verify).toHaveBeenCalled();

        expect(req.user).toEqual({
            userId: "user-id-123",
            role: "customer",
        });

        expect(next).toHaveBeenCalled();
    });

    test("should reject invalid or expired token", () => {
        req.headers.authorization =
            "Bearer invalid-token";

        jwt.verify.mockImplementation(() => {
            throw new Error("Token expired");
        });

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid or expired access token",
        });

        expect(next).not.toHaveBeenCalled();
    });
});