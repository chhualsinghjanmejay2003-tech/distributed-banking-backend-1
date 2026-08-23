const userRepository = require("../repositories/user.repository");
const {
    hashPassword,
} = require("../utils/password");

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

module.exports = {
    register,
};