import { body } from "express-validator"

export const validateUserRegisterInput = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('phoneNo').notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
]


export const validateUserVerifyInput = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('code').notEmpty().withMessage('otp is required')
]