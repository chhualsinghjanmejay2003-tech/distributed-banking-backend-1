jest.mock("../src/utils/password", () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
}));

jest.mock("../src/utils/jwt", () => ({
    generateAccessToken: jest.fn(),
}));

const userRepository = require("../src/repositories/user.repository");
const password = require("../src/utils/password");
const jwt = require("../src/utils/jwt");
const authService = require("../src/services/auth.service");

describe("Auth Service - Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should login successfully with valid credentials", async () => {
        const user = {
            _id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            passwordHash: "hashed-password",
            role: "customer",
            isActive: true,
        };

        userRepository.findByEmail = jest.fn()
            .mockResolvedValue(user);

        password.comparePassword.mockResolvedValue(true);

        jwt.generateAccessToken.mockReturnValue(
            "mock-access-token"
        );

        const result = await authService.login({
            email: " JANMEJAY@EXAMPLE.COM ",
            password: "StrongPassword123!",
        });

        expect(
            userRepository.findByEmail
        ).toHaveBeenCalledWith(
            "janmejay@example.com"
        );

        expect(
            password.comparePassword
        ).toHaveBeenCalledWith(
            "StrongPassword123!",
            "hashed-password"
        );

        expect(
            jwt.generateAccessToken
        ).toHaveBeenCalledWith(user);

        expect(result.accessToken).toBe(
            "mock-access-token"
        );

        expect(result.user).toEqual({
            id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            role: "customer",
            isActive: true,
        });
    });

    test("should reject login when user does not exist", async () => {
        userRepository.findByEmail = jest.fn()
            .mockResolvedValue(null);

        await expect(
            authService.login({
                email: "unknown@example.com",
                password: "StrongPassword123!",
            })
        ).rejects.toMatchObject({
            message: "Invalid email or password",
            statusCode: 401,
        });

        expect(
            password.comparePassword
        ).not.toHaveBeenCalled();

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });

    test("should reject login when password is incorrect", async () => {
        const user = {
            _id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            passwordHash: "hashed-password",
            role: "customer",
            isActive: true,
        };

        userRepository.findByEmail = jest.fn()
            .mockResolvedValue(user);

        password.comparePassword.mockResolvedValue(false);

        await expect(
            authService.login({
                email: "janmejay@example.com",
                password: "WrongPassword123!",
            })
        ).rejects.toMatchObject({
            message: "Invalid email or password",
            statusCode: 401,
        });

        expect(
            password.comparePassword
        ).toHaveBeenCalledWith(
            "WrongPassword123!",
            "hashed-password"
        );

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });

    test("should reject login when account is inactive", async () => {
        const user = {
            _id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            passwordHash: "hashed-password",
            role: "customer",
            isActive: false,
        };

        userRepository.findByEmail = jest.fn()
            .mockResolvedValue(user);

        await expect(
            authService.login({
                email: "janmejay@example.com",
                password: "StrongPassword123!",
            })
        ).rejects.toMatchObject({
            message: "Account is inactive",
            statusCode: 403,
        });

        expect(
            password.comparePassword
        ).not.toHaveBeenCalled();

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });
});