jest.mock("../src/config/env", () => ({
    internalApiKey: "test-internal-key",
}));

const internalAuth = require(
    "../src/middleware/internalAuth.middleware"
);

describe("Internal Auth Middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = {
            headers: {},
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        next = jest.fn();
    });

    test("should allow request with valid internal API key", () => {
        req.headers["x-internal-api-key"] =
            "test-internal-key";

        internalAuth(req, res, next);

        expect(next).toHaveBeenCalled();

        expect(res.status).not.toHaveBeenCalled();
    });

    test("should reject request without API key", () => {
        internalAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Unauthorized",
        });

        expect(next).not.toHaveBeenCalled();
    });

    test("should reject request with invalid API key", () => {
        req.headers["x-internal-api-key"] =
            "wrong-key";

        internalAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);

        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Unauthorized",
        });

        expect(next).not.toHaveBeenCalled();
    });
});