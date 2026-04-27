import { body } from 'express-validator';

export const validateTailorRegisterInput = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('phoneNo').notEmpty().withMessage('Phone number is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be either male, female or other').notEmpty().withMessage('Gender is required'),
    body('age').isInt({ min: 18, max: 70 }).withMessage('Age must be between 18 and 70').notEmpty().withMessage('Age is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('servicesOffered').isArray({ min: 1 }).withMessage('At least one service must be offered'),
    body('servicesOffered.*.serviceType').notEmpty().withMessage('Service type is required'),
    body('servicesOffered.*.price').isNumeric().withMessage('Price must be a number'),
    body('verificationType').isIn(['adharCard', 'voterId']).withMessage('Verification type must be either adharCard or voterId')
]

export const validateTailorVerifyInput = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('code')
        .notEmpty().withMessage('code is required')
        .isLength({ min: 6, max: 6 }).withMessage('code must be 6 characters long')
]