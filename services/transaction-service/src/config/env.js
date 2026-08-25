require("dotenv").config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error(
        "MONGO_URI is not defined"
    );
}

module.exports = {
    mongoUri,
};