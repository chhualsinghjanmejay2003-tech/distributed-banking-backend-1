jest.mock("../src/utils/password", () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
}));

const userRepository = require("../src/repositories/user.repository");
const password = require("../src/utils/password");
const authService = require("../src/services/auth.service");

describe("Auth Service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should register a new user", async () => {
        userRepository.findByEmail = jest.fn()
            .mockResolvedValue(null);

        password.hashPassword
            .mockResolvedValue("hashed-password");

        userRepository.create = jest.fn()
            .mockResolvedValue({
                _id: "user-id-123",
                name: "Janmejay",
                email: "janmejay@example.com",
                role: "customer",
                isActive: true,
                createdAt: new Date(),
            });

        const result = await authService.register({
            name: "Janmejay",
            email: " JANMEJAY@EXAMPLE.COM ",
            password: "StrongPassword123!",
        });

        expect(
            userRepository.findByEmail
        ).toHaveBeenCalledWith(
            "janmejay@example.com"
        );

        expect(
            password.hashPassword
        ).toHaveBeenCalledWith(
            "StrongPassword123!"
        );

        expect(
            userRepository.create
        ).toHaveBeenCalledWith({
            name: "Janmejay",
            email: "janmejay@example.com",
            passwordHash: "hashed-password",
        });

        expect(result.email).toBe(
            "janmejay@example.com"
        );

        expect(result.passwordHash).toBeUndefined();
    });

    test("should reject duplicate email", async () => {
        userRepository.findByEmail = jest.fn()
            .mockResolvedValue({
                _id: "existing-user",
                email: "janmejay@example.com",
            });

        await expect(
            authService.register({
                name: "Janmejay",
                email: "janmejay@example.com",
                password: "StrongPassword123!",
            })
        ).rejects.toMatchObject({
            message: "Email already registered",
            statusCode: 409,
        });

        expect(
            password.hashPassword
        ).not.toHaveBeenCalled();
    });
});