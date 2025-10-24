const express = require('express');
const { body } = require('express-validator');
const {
    createRental,
    getMyBookings,
    getRentalById,
    updateRentalStatus,
    returnCar,
    getOwnerBookings
} = require('../controllers/rentalController');
const { auth, ownerAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Customer routes
router.post(
    '/',
    auth,
    [
        body('car_id').isInt({ min: 1 }).withMessage('Valid car ID is required'),
        body('start_date').isDate().withMessage('Valid start date is required'),
        body('end_date').isDate().withMessage('Valid end date is required'),
        body('discount_code').optional().isString()
    ],
    handleValidationErrors,
    createRental
);

// router.get('/my-bookings', auth, getMyBookings);
router.get('/my-bookings',auth, getMyBookings); // temporarily bypass auth
router.get('/:id', auth, getRentalById);

// Owner routes
router.get('/owner/bookings', auth, ownerAuth, getOwnerBookings);
router.patch(
    '/:id/status',
    auth,
    ownerAuth,
    [
        body('status').isIn(['confirmed', 'cancelled', 'active', 'completed']).withMessage('Valid status is required')
    ],
    handleValidationErrors,
    updateRentalStatus
);

router.post(
    '/:id/return',
    auth,
    ownerAuth,
    [
        body('end_mileage').isInt({ min: 0 }).withMessage('Valid end mileage is required')
    ],
    handleValidationErrors,
    returnCar
);

module.exports = router;