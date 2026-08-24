const authService = require("../services/auth.service");
const { registerSchema } = require("../validation/auth.validation");

const register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(
            req.body,
            {
                abortEarly: false,
                stripUnknown: true,
            }
        );

        if (error) {
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                details: error.details.map((detail) => detail.message),
            });
        }

        const user = await authService.register(value);

        return res.status(201).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
};