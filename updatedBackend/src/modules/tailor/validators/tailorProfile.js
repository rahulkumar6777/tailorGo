import { body } from 'express-validator';


export const tailorProfileValidate = [
    body('username')
        .notEmpty()
        .withMessage('username is required')
        .isString()
        .withMessage('username must be a string')
]