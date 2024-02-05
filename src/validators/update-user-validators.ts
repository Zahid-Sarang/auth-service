import { checkSchema } from "express-validator";

export default checkSchema({
    firstName: {
        errorMessage: "First name is required!",
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: "Last name is required!",
        notEmpty: true,
        trim: true,
    },
    role: {
        errorMessage: "Role is required!",
        notEmpty: true,
        trim: true,
    },
    email: {
        trim: true,
        errorMessage: "Email is required!",
        notEmpty: true,
        isEmail: {
            errorMessage: "Email should be a valid email",
        },
    },
    tenantId: {
        errorMessage: "Tenant is required!",
        notEmpty: true,
        trim: true,
    },
});
