const jwt = require("jsonwebtoken");

const {
    generateAccessToken,
    verifyAccessToken,
} = require("../src/utils/jwt");

describe("JWT Utility", () => {
    const user = {
        _id: "user-id-123",
        role: "customer",
    };

    test("should generate a valid access token", () => {
        const token = generateAccessToken(user);

        expect(token).toBeDefined();
        expect(typeof token).toBe("string");

        const decoded = jwt.decode(token);

        expect(decoded).toBeDefined();
    });

    test("should include user id as subject", () => {
        const token = generateAccessToken(user);

        const decoded = jwt.decode(token);

        expect(decoded.sub).toBe("user-id-123");
    });

    test("should include user role", () => {
        const token = generateAccessToken(user);

        const decoded = jwt.decode(token);

        expect(decoded.role).toBe("customer");
    });

    test("should verify a valid access token", () => {
        const token = generateAccessToken(user);

        const decoded = verifyAccessToken(token);

        expect(decoded.sub).toBe("user-id-123");
        expect(decoded.role).toBe("customer");
    });

    test("should reject a tampered token", () => {
        const token = generateAccessToken(user);

        const tamperedToken =
            token.slice(0, -1) +
            (token.slice(-1) === "a" ? "b" : "a");

        expect(() => {
            verifyAccessToken(tamperedToken);
        }).toThrow();
    });

    test("should reject an invalid token", () => {
        expect(() => {
            verifyAccessToken("this-is-not-a-valid-jwt");
        }).toThrow();
    });
});