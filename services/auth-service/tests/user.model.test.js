const mongoose = require("mongoose");
const User = require("../src/models/user.model");

describe("User Model", () => {
    test("should create a valid user object", () => {
        const user = new User({
            name: "Test User",
            email: "test@example.com",
            passwordHash: "hashed-password",
        });

        expect(user.name).toBe("Test User");
        expect(user.email).toBe("test@example.com");
        expect(user.passwordHash).toBe("hashed-password");
        expect(user.role).toBe("customer");
        expect(user.isActive).toBe(true);
    });

    test("should reject user without required fields", async () => {
        const user = new User({});

        let error;

        try {
            await user.validate();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.errors.name).toBeDefined();
        expect(error.errors.email).toBeDefined();
        expect(error.errors.passwordHash).toBeDefined();
    });
});