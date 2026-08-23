const User = require("../models/user.model");

const findByEmail = async (email) => {
    return User.findOne({ email }).select("+passwordHash");
};

const findById = async (userId) => {
    return User.findById(userId);
};

const create = async (userData) => {
    return User.create(userData);
};

module.exports = {
    findByEmail,
    findById,
    create,
};