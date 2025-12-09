const { pool } = require('../config/database');

/**
 * Process payment for a rental
 */
const processPayment = async (req, res, next) => {
    try {
        const { rental_id, payment_method, transaction_id } = req.body;
        const customer_id = req.user.id;

        // Validation
        if (!rental_id || !payment_method) {
            return res.status(400).json({
                success: false,
                message: 'Rental ID and payment method are required'
            });
        }

        // Verify rental belongs to customer and get amount
        const [rentals] = await pool.execute(
            'SELECT * FROM rentals WHERE id = ? AND customer_id = ?',
            [rental_id, customer_id]
        );

        if (rentals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rental not found or does not belong to you'
            });
        }

        const rental = rentals[0];

        // Check if rental is in pending or confirmed status
        if (!['pending', 'confirmed'].includes(rental.status)) {
            return res.status(400).json({
                success: false,
                message: 'Payment can only be processed for pending or confirmed rentals'
            });
        }

        // Check if payment already exists
        const [existingPayments] = await pool.execute(
            'SELECT * FROM payments WHERE rental_id = ? AND payment_status IN ("completed", "pending")',
            [rental_id]
        );

        if (existingPayments.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment already exists for this rental'
            });
        }

        // Create payment record
        const [paymentResult] = await pool.execute(
            `INSERT INTO payments (rental_id, amount, payment_method, payment_status, transaction_id, payment_date)
             VALUES (?, ?, ?, 'completed', ?, NOW())`,
            [rental_id, rental.final_amount, payment_method, transaction_id || null]
        );

        // Update rental status to confirmed if it was pending
        if (rental.status === 'pending') {
            await pool.execute(
                'UPDATE rentals SET status = "confirmed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [rental_id]
            );
        }

        // Get complete payment details
        const [payments] = await pool.execute(
            `SELECT p.*, r.customer_id, r.car_id, r.final_amount as rental_amount
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             WHERE p.id = ?`,
            [paymentResult.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Payment processed successfully',
            data: payments[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment details by ID
 */
const getPaymentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const customer_id = req.user.id;

        const [payments] = await pool.execute(
            `SELECT p.*, r.customer_id, r.car_id, r.start_date, r.end_date, 
                    c.brand, c.model, c.image_url
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             JOIN cars c ON r.car_id = c.id
             WHERE p.id = ? AND r.customer_id = ?`,
            [id, customer_id]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payments[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment history for logged-in customer
 */
const getPaymentHistory = async (req, res, next) => {
    try {
        const customer_id = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;

        const [payments] = await pool.execute(
            `SELECT p.*, r.start_date, r.end_date, r.status as rental_status,
                    c.brand, c.model, c.image_url, cat.name as category_name
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             JOIN cars c ON r.car_id = c.id
             JOIN car_categories cat ON c.category_id = cat.id
             WHERE r.customer_id = ?
             ORDER BY p.created_at DESC
             LIMIT ${limitNum} OFFSET ${offset}`,
            [customer_id]
        );

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             WHERE r.customer_id = ?`,
            [customer_id]
        );

        const total = countResult[0].total;

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update payment status (Admin only - for now accessible to all authenticated users)
 */
const updatePaymentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        if (!payment_status || !['pending', 'completed', 'failed', 'refunded'].includes(payment_status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid payment status is required (pending, completed, failed, refunded)'
            });
        }

        // Check if payment exists
        const [payments] = await pool.execute(
            'SELECT * FROM payments WHERE id = ?',
            [id]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Update payment status
        await pool.execute(
            'UPDATE payments SET payment_status = ?, payment_date = NOW() WHERE id = ?',
            [payment_status, id]
        );

        res.json({
            success: true,
            message: `Payment status updated to ${payment_status}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Process refund for a payment
 */
const processRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Get payment details
        const [payments] = await pool.execute(
            `SELECT p.*, r.status as rental_status, r.id as rental_id
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             WHERE p.id = ?`,
            [id]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const payment = payments[0];

        // Check if payment can be refunded
        if (payment.payment_status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: 'Payment has already been refunded'
            });
        }

        if (payment.payment_status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed payments can be refunded'
            });
        }

        // Update payment status to refunded
        await pool.execute(
            'UPDATE payments SET payment_status = "refunded" WHERE id = ?',
            [id]
        );

        // Update rental status to cancelled if not already completed
        if (payment.rental_status !== 'completed') {
            await pool.execute(
                'UPDATE rentals SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [payment.rental_id]
            );
        }

        res.json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                payment_id: id,
                refund_amount: payment.amount,
                reason: reason || 'No reason provided'
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get payment by rental ID
 */
const getPaymentByRentalId = async (req, res, next) => {
    try {
        const { rental_id } = req.params;
        const customer_id = req.user.id;

        const [payments] = await pool.execute(
            `SELECT p.*, r.customer_id
             FROM payments p
             JOIN rentals r ON p.rental_id = r.id
             WHERE p.rental_id = ? AND r.customer_id = ?`,
            [rental_id, customer_id]
        );

        if (payments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found for this rental'
            });
        }

        res.json({
            success: true,
            data: payments[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    processPayment,
    getPaymentDetails,
    getPaymentHistory,
    updatePaymentStatus,
    processRefund,
    getPaymentByRentalId
};
