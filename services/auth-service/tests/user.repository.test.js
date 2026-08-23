const mongoose = require("mongoose");

const User = require("../src/models/user.model");
const userRepository = require("../src/repositories/user.repository");

describe("User Repository", () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(
                process.env.MONGODB_URI ||
                "mongodb://localhost:27017/banking"
            );
        }
    });

    afterEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    test("should create and find a user by email", async () => {
        const createdUser = await userRepository.create({
            name: "Repository Test",
            email: "repository@example.com",
            passwordHash: "hashed-password",
        });

        const foundUser = await userRepository.findByEmail(
            "repository@example.com"
        );

        expect(foundUser).not.toBeNull();
        expect(foundUser._id.toString()).toBe(
            createdUser._id.toString()
        );
        expect(foundUser.passwordHash).toBe("hashed-password");
    });

    test("should find a user by ID", async () => {
        const createdUser = await userRepository.create({
            name: "ID Test",
            email: "id@example.com",
            passwordHash: "hashed-password",
        });

        const foundUser = await userRepository.findById(
            createdUser._id
        );

        expect(foundUser).not.toBeNull();
        expect(foundUser.email).toBe("id@example.com");
    });
});