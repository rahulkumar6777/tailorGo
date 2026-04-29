import { body } from "express-validator";

export const validateChangeUsername = [
    body('username')
        .notEmpty()
        .withMessage('username is required')
        .isString()
        .withMessage('username must me be string')
]