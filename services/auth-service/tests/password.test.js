const {
    hashPassword,
    comparePassword,
} = require("../src/utils/password");

describe("Password utility", () => {
    test("should hash a password", async () => {
        const password = "StrongPassword123!";

        const passwordHash = await hashPassword(password);

        expect(passwordHash).toBeDefined();
        expect(passwordHash).not.toBe(password);
    });

    test("should correctly compare a valid password", async () => {
        const password = "StrongPassword123!";

        const passwordHash = await hashPassword(password);

        const result = await comparePassword(
            password,
            passwordHash
        );

        expect(result).toBe(true);
    });

    test("should reject an incorrect password", async () => {
        const password = "StrongPassword123!";
        const wrongPassword = "WrongPassword123!";

        const passwordHash = await hashPassword(password);

        const result = await comparePassword(
            wrongPassword,
            passwordHash
        );

        expect(result).toBe(false);
    });
});