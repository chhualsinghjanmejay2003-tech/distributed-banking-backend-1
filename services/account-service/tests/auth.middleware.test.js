jest.mock("../src/utils/jwt", () => ({
    verifyAccessToken: jest.fn(),
}));

const {
    verifyAccessToken,
} = require("../src/utils/jwt");

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
            json: jest.fn().mockReturnThis(),
        };

        next = jest.fn();
    });

    test("should reject request when authorization header is missing", () => {
        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Authentication required",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should reject invalid authorization format", () => {
        req.headers.authorization = "InvalidToken";

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid authorization header",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should reject authorization header without token", () => {
        req.headers.authorization = "Bearer";

        authenticate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid authorization header",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should reject invalid or expired token", () => {
        req.headers.authorization =
            "Bearer invalid-token";

        verifyAccessToken.mockImplementation(() => {
            throw new Error("jwt expired");
        });

        authenticate(req, res, next);

        expect(
            verifyAccessToken
        ).toHaveBeenCalledWith(
            "invalid-token"
        );

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Invalid or expired token",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should attach decoded user to req.user", () => {
        req.headers.authorization =
            "Bearer valid-token";

        const decodedUser = {
            id: "user-id-123",
            role: "customer",
        };

        verifyAccessToken.mockReturnValue(
            decodedUser
        );

        authenticate(req, res, next);

        expect(
            verifyAccessToken
        ).toHaveBeenCalledWith(
            "valid-token"
        );

        expect(req.user).toEqual(
            decodedUser
        );

        expect(next).toHaveBeenCalledTimes(1);
    });
});