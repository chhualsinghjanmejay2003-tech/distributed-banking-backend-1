jest.mock("../src/repositories/user.repository", () => ({
    findById: jest.fn(),
}));

jest.mock("../src/repositories/session.repository", () => ({
    getSession: jest.fn(),
}));

jest.mock("../src/utils/jwt", () => ({
    generateAccessToken: jest.fn(),
}));

const userRepository = require(
    "../src/repositories/user.repository"
);

const sessionRepository = require(
    "../src/repositories/session.repository"
);

const jwt = require("../src/utils/jwt");

const authService = require(
    "../src/services/auth.service"
);

describe("Auth Service - Refresh", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should generate a new access token with valid refresh token", async () => {
        const user = {
            _id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            role: "customer",
            isActive: true,
        };

        sessionRepository.getSession.mockResolvedValue({
            userId: "user-id-123",
            role: "customer",
        });

        userRepository.findById.mockResolvedValue(user);

        jwt.generateAccessToken.mockReturnValue(
            "new-access-token"
        );

        const result = await authService.refresh(
            "valid-refresh-token"
        );

        expect(
            sessionRepository.getSession
        ).toHaveBeenCalledWith(
            "valid-refresh-token"
        );

        expect(
            userRepository.findById
        ).toHaveBeenCalledWith(
            "user-id-123"
        );

        expect(
            jwt.generateAccessToken
        ).toHaveBeenCalledWith(user);

        expect(result).toEqual({
            accessToken: "new-access-token",
        });
    });

    test("should reject when refresh token is missing", async () => {
        await expect(
            authService.refresh()
        ).rejects.toMatchObject({
            message: "Refresh token is required",
            statusCode: 401,
        });

        expect(
            sessionRepository.getSession
        ).not.toHaveBeenCalled();

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });

    test("should reject invalid refresh token", async () => {
        sessionRepository.getSession.mockResolvedValue(
            null
        );

        await expect(
            authService.refresh(
                "invalid-refresh-token"
            )
        ).rejects.toMatchObject({
            message: "Invalid or expired refresh token",
            statusCode: 401,
        });

        expect(
            userRepository.findById
        ).not.toHaveBeenCalled();

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });

    test("should reject when user no longer exists", async () => {
        sessionRepository.getSession.mockResolvedValue({
            userId: "deleted-user",
            role: "customer",
        });

        userRepository.findById.mockResolvedValue(
            null
        );

        await expect(
            authService.refresh(
                "valid-refresh-token"
            )
        ).rejects.toMatchObject({
            message: "User not found",
            statusCode: 401,
        });

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });

    test("should reject when account is inactive", async () => {
        sessionRepository.getSession.mockResolvedValue({
            userId: "user-id-123",
            role: "customer",
        });

        userRepository.findById.mockResolvedValue({
            _id: "user-id-123",
            name: "Janmejay",
            email: "janmejay@example.com",
            role: "customer",
            isActive: false,
        });

        await expect(
            authService.refresh(
                "valid-refresh-token"
            )
        ).rejects.toMatchObject({
            message: "Account is inactive",
            statusCode: 403,
        });

        expect(
            jwt.generateAccessToken
        ).not.toHaveBeenCalled();
    });
});