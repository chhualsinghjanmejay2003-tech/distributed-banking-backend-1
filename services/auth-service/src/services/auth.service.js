const userRepository = require("../repositories/user.repository");
const {
    hashPassword,
    comparePassword,
} = require("../utils/password");

const {
    generateAccessToken,
} = require("../utils/jwt");

const {
    generateRefreshToken,
} = require("../utils/refreshToken");

const {
    createSession,
    getSession,
} = require("../repositories/session.repository");

const {
    parseDurationToSeconds,
} = require("../utils/time");

const env = require("../config/env");

const register = async ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser =
        await userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
    };
};

const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await userRepository.findByEmail(
        normalizedEmail
    );

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const passwordMatches = await comparePassword(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();

    const refreshTokenTtl = parseDurationToSeconds(
        env.jwtRefreshExpiresIn
    );

    await createSession(
        refreshToken,
        {
            userId: user._id.toString(),
            role: user.role,
        },
        refreshTokenTtl
    );

    return {
        accessToken,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    };
};

const refresh = async (refreshToken) => {
    if (!refreshToken) {
        const error = new Error("Refresh token is required");
        error.statusCode = 401;
        throw error;
    }

    const session = await getSession(refreshToken);

    if (!session) {
        const error = new Error("Invalid or expired refresh token");
        error.statusCode = 401;
        throw error;
    }

    const user = await userRepository.findById(
        session.userId
    );

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const accessToken = generateAccessToken(user);

    return {
        accessToken,
    };
};

module.exports = {
    register,
    login,
    refresh,
};