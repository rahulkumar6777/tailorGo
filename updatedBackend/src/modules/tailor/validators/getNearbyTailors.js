import { query } from 'express-validator';

export const validateNearbyTailors = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('invalid latitude'),

  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('invalid longitude'),

  query('radius')
    .optional()
    .isFloat({ min: 1, max: 15 }).withMessage('radius must be between 1-15 km'),

  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('location must be 2-80 characters'),

  query('outfit')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 }).withMessage('outfit must be 2-60 characters'),

  query().custom((value) => {
    const hasLat = value.lat !== undefined && value.lat !== '';
    const hasLng = value.lng !== undefined && value.lng !== '';
    const hasLocation = Boolean(value.location?.trim());
    const hasOutfit = Boolean(value.outfit?.trim());

    if (hasLat !== hasLng) {
      throw new Error('both latitude and longitude are required together');
    }

    if (!hasLat && !hasLocation && !hasOutfit) {
      throw new Error('location, outfit, or coordinates are required');
    }

    return true;
  }),
];
