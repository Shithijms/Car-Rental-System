const express = require('express');
const { body } = require('express-validator');
const {
    submitReview,
    getCarReviews,
    getMyReviews
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.post(
    '/',
    auth,
    [
        body('rental_id').isInt({ min: 1 }).withMessage('Valid rental ID is required'),
        body('car_id').isInt({ min: 1 }).withMessage('Valid car ID is required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isString().isLength({ max: 500 }).withMessage('Comment must be less than 500 characters')
    ],
    handleValidationErrors,
    submitReview
);

router.get('/car/:carId', getCarReviews);
router.get('/my-reviews', auth, getMyReviews);

module.exports = router;