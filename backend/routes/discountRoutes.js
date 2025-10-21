const express = require('express');
const { body } = require('express-validator');
const {
    validateDiscountCode,
    getAllDiscounts,
    createDiscount,
    deleteDiscount
} = require('../controllers/discountController');
const { auth, ownerAuth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Public route
router.post(
    '/validate',
    [
        body('code').notEmpty().withMessage('Discount code is required'),
        body('rental_days').optional().isInt({ min: 1 }).withMessage('Rental days must be a positive number')
    ],
    handleValidationErrors,
    validateDiscountCode
);

// Owner routes
router.get('/', auth, ownerAuth, getAllDiscounts);

router.post(
    '/',
    auth,
    ownerAuth,
    [
        body('code').notEmpty().withMessage('Code is required'),
        body('discount_type').isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
        body('discount_value').isFloat({ min: 0 }).withMessage('Valid discount value is required'),
        body('valid_from').isDate().withMessage('Valid from date is required'),
        body('valid_until').isDate().withMessage('Valid until date is required'),
        body('usage_limit').optional().isInt({ min: 1 }).withMessage('Usage limit must be a positive number'),
        body('min_rental_days').optional().isInt({ min: 1 }).withMessage('Minimum rental days must be a positive number')
    ],
    handleValidationErrors,
    createDiscount
);

router.delete('/:id', auth, ownerAuth, deleteDiscount);

module.exports = router;