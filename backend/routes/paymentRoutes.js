const express = require('express');
const { body } = require('express-validator');
const {
    processPayment,
    getPaymentsByRental,
    getMyPayments
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.post(
    '/',
    auth,
    [
        body('rental_id').isInt({ min: 1 }).withMessage('Valid rental ID is required'),
        body('payment_method').isIn(['credit_card', 'debit_card', 'cash', 'online']).withMessage('Valid payment method is required'),
        body('transaction_id').optional().isString()
    ],
    handleValidationErrors,
    processPayment
);

router.get('/rental/:rentalId', auth, getPaymentsByRental);
router.get('/my-payments', auth, getMyPayments);

module.exports = router;