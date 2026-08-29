const bcrypt  = require("bcrypt");

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

module.exports = {
    hashPassword,
    comparePassword,
};