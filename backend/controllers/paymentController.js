const { pool } = require('../config/database');

const processPayment = async (req, res, next) => {
    try {
        const { rental_id, payment_method = 'credit_card', transaction_id } = req.body;

        if (!rental_id) {
            return res.status(400).json({
                success: false,
                message: 'Rental ID is required'
            });
        }

        // Get rental details
        const [rentals] = await pool.execute(
            `SELECT 
        r.final_amount,
        r.status,
        p.id as payment_id,
        p.payment_status
      FROM rentals r
      LEFT JOIN payments p ON r.id = p.rental_id
      WHERE r.id = ? AND r.customer_id = ?`,
            [rental_id, req.user.id]
        );

        if (rentals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rental not found'
            });
        }

        const rental = rentals[0];

        if (rental.status !== 'confirmed' && rental.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Payment can only be processed for confirmed or pending rentals'
            });
        }

        let paymentId;
        let paymentStatus = 'completed';

        // Check if payment already exists
        if (rental.payment_id) {
            // Update existing payment
            await pool.execute(
                `UPDATE payments 
         SET payment_status = ?, payment_method = ?, transaction_id = ?, payment_date = NOW() 
         WHERE id = ?`,
                [paymentStatus, payment_method, transaction_id, rental.payment_id]
            );
            paymentId = rental.payment_id;
        } else {
            // Create new payment
            const [result] = await pool.execute(
                `INSERT INTO payments (rental_id, amount, payment_method, payment_status, transaction_id, payment_date) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
                [rental_id, rental.final_amount, payment_method, paymentStatus, transaction_id]
            );
            paymentId = result.insertId;
        }

        // Update rental status to confirmed if it was pending
        if (rental.status === 'pending') {
            await pool.execute(
                'UPDATE rentals SET status = "confirmed" WHERE id = ?',
                [rental_id]
            );
        }

        // Get payment details
        const [payments] = await pool.execute(
            'SELECT * FROM payments WHERE id = ?',
            [paymentId]
        );

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: payments[0]
        });
    } catch (error) {
        next(error);
    }
};

const getPaymentsByRental = async (req, res, next) => {
    try {
        const { rentalId } = req.params;

        const [payments] = await pool.execute(
            `SELECT p.*, r.final_amount, r.status as rental_status
       FROM payments p
       JOIN rentals r ON p.rental_id = r.id
       WHERE p.rental_id = ? AND r.customer_id = ?`,
            [rentalId, req.user.id]
        );

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

const getMyPayments = async (req, res, next) => {
    try {
        const customer_id = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const query = `
      SELECT 
        p.*,
        r.id as rental_id,
        r.start_date,
        r.end_date,
        r.final_amount,
        c.brand,
        c.model,
        c.image_url
      FROM payments p
      JOIN rentals r ON p.rental_id = r.id
      JOIN cars c ON r.car_id = c.id
      WHERE r.customer_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

        const [payments] = await pool.execute(query, [
            customer_id,
            parseInt(limit),
            (page - 1) * limit
        ]);

        // Count total
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM payments p JOIN rentals r ON p.rental_id = r.id WHERE r.customer_id = ?',
            [customer_id]
        );
        const total = countResult[0].total;

        res.json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    processPayment,
    getPaymentsByRental,
    getMyPayments
};