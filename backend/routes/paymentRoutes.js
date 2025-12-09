const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    processPayment,
    getPaymentDetails,
    getPaymentHistory,
    updatePaymentStatus,
    processRefund,
    getPaymentByRentalId
} = require('../controllers/paymentController');

// All routes require authentication
router.use(auth);

// Process payment for a rental
router.post('/process', processPayment);

// Get payment history for logged-in customer
router.get('/history', getPaymentHistory);

// Get payment details by ID
router.get('/:id', getPaymentDetails);

// Get payment by rental ID
router.get('/rental/:rental_id', getPaymentByRentalId);

// Update payment status (Admin functionality)
router.put('/:id/status', updatePaymentStatus);

// Process refund
router.post('/:id/refund', processRefund);

module.exports = router;
