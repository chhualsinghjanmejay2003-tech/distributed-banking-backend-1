const userRepository = require("../repositories/user.repository");
const {
    hashPassword,
    comparePassword,
} = require("../utils/password");

const {
    generateAccessToken,
} = require("../utils/jwt");

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

    return {
        accessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        },
    };
};

module.exports = {
    register,
    login,
};