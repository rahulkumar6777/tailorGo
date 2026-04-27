import { body } from "express-validator";

export const loginValidate = [
    body('email')
        .notEmpty()
        .withMessage("email is required")
        .isEmail()
        .withMessage('invalid email formet'),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isString()
        .withMessage('passowrd must be a string')
]