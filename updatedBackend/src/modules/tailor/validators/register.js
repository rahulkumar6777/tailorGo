import { body } from 'express-validator';

const normalizeServicesOffered = (servicesOffered) => {
    if (Array.isArray(servicesOffered)) return servicesOffered;

    if (typeof servicesOffered === 'string') {
        try {
            const parsedServices = JSON.parse(servicesOffered);
            if (Array.isArray(parsedServices)) return parsedServices;
        } catch (error) {
            return servicesOffered;
        }
    }

    if (servicesOffered && typeof servicesOffered === 'object') {
        return Object.keys(servicesOffered)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => servicesOffered[key]);
    }

    return servicesOffered;
}

export const validateTailorRegisterInput = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('phoneNo').notEmpty().withMessage('Phone number is required'),
    body('experience').notEmpty().withMessage(''),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be either male, female or other').notEmpty().withMessage('Gender is required'),
    body('age').isInt({ min: 18, max: 70 }).withMessage('Age must be between 18 and 70').notEmpty().withMessage('Age is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('coordinates').custom((value) => {
        if (!value || typeof value !== 'object') {
            throw new Error('coordinates must be object');
        }

        const { lat, lng } = value;

        if (typeof lat !== 'number' || lat < -90 || lat > 90) {
            throw new Error('invalid latitude');
        }

        if (typeof lng !== 'number' || lng < -180 || lng > 180) {
            throw new Error('invalid longitude');
        }

        return true;
    }),
    body('shopName').notEmpty().withMessage('Shop name is required'),
    body('servicesOffered').customSanitizer(normalizeServicesOffered).isArray({ min: 1 }).withMessage('At least one service must be offered'),
    body('servicesOffered.*.serviceType').notEmpty().withMessage('Service type is required'),
    body('servicesOffered.*.price').isNumeric().withMessage('Price must be a number'),
    body('verificationType').isIn(['adharCard', 'aadharCard', 'voterId']).withMessage('Verification type must be either adharCard, aadharCard or voterId')
]

export const validateTailorVerifyInput = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format'),
    body('code')
        .notEmpty().withMessage('code is required')
        .isLength({ min: 6, max: 6 }).withMessage('code must be 6 characters long')
]
