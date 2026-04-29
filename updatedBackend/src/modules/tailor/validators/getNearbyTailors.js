import { query } from 'express-validator';

export const validateNearbyTailors = [
  query('lat')
    .notEmpty().withMessage('latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('invalid latitude'),

  query('lng')
    .notEmpty().withMessage('longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('invalid longitude'),

  query('radius')
    .optional()
    .isFloat({ min: 1, max: 50 }).withMessage('radius must be between 1-50 km'),
];