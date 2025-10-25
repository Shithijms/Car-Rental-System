const { pool } = require('../config/database');

const createRental = async (req, res, next) => {
    try {
        const { car_id, start_date, end_date, discount_code } = req.body;
        const customer_id = req.user.id;

        // Validation
        if (!car_id || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'Car ID, start date, and end date are required'
            });
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            });
        }

        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        // Use stored procedure to create rental
        const [result] = await pool.execute(
            'CALL sp_create_rental(?, ?, ?, ?, ?)',
            [customer_id, car_id, start_date, end_date, discount_code || null]
        );

        const rentalId = result[0][0].rental_id;

        // Get complete rental details
        const [rentals] = await pool.execute(
            `SELECT 
        r.*,
        c.brand,
        c.model,
        c.image_url,
        cat.name as category_name,
        b.name as branch_name,
        cust.name as customer_name
      FROM rentals r
      JOIN cars c ON r.car_id = c.id
      JOIN car_categories cat ON c.category_id = cat.id
      JOIN branches b ON r.branch_id = b.id
      JOIN customers cust ON r.customer_id = cust.id
      WHERE r.id = ?`,
            [rentalId]
        );

        res.status(201).json({
            success: true,
            message: 'Rental booking created successfully',
            data: rentals[0]
        });
    } catch (error) {
        if (error.code === '45000') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};
const getMyBookings = async (req, res) => {
    try {
        const customerId = req.user.id;
        const limit = 10;
        const offset = 0;

        const query = `
      SELECT
        r.*,
        c.brand,
        c.model,
        c.image_url,
        cat.name AS category_name,
        b.name AS branch_name,
        p.payment_status
      FROM rentals r
      JOIN cars c ON r.car_id = c.id
      JOIN car_categories cat ON c.category_id = cat.id
      JOIN branches b ON r.branch_id = b.id
      LEFT JOIN payments p ON r.id = p.rental_id
      WHERE r.customer_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

        const [rentals] = await pool.execute(query, [customerId]);
        return res.json({ success: true, data: rentals });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const updateRentalStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['confirmed', 'cancelled', 'active', 'completed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (confirmed, cancelled, active, completed)'
            });
        }

        // Check if rental exists and get current status
        const [rentals] = await pool.execute(
            'SELECT status, car_id FROM rentals WHERE id = ?',
            [id]
        );

        if (rentals.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rental not found'
            });
        }

        const currentStatus = rentals[0].status;
        const car_id = rentals[0].car_id;

        // Validate status transition
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['active', 'cancelled'],
            'active': ['completed'],
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[currentStatus].includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${currentStatus} to ${status}`
            });
        }

        // Update rental status
        const [result] = await pool.execute(
            'UPDATE rentals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        // If activating rental, set start mileage
        if (status === 'active') {
            const [car] = await pool.execute('SELECT mileage FROM cars WHERE id = ?', [car_id]);
            if (car.length > 0) {
                await pool.execute(
                    'UPDATE rentals SET start_mileage = ? WHERE id = ?',
                    [car[0].mileage, id]
                );
            }
        }

        res.json({
            success: true,
            message: `Rental status updated to ${status}`
        });
    } catch (error) {
        next(error);
    }
};

const returnCar = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { end_mileage } = req.body;

        if (!end_mileage || end_mileage < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid end mileage is required'
            });
        }

        // Use stored procedure to return car
        const [result] = await pool.execute(
            'CALL sp_return_car(?, ?)',
            [id, end_mileage]
        );

        res.json({
            success: true,
            message: 'Car returned successfully'
        });
    } catch (error) {
        if (error.code === '45000') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};const getOwnerBookings = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;

        let query = 'SELECT r.*, c.brand, c.model, c.image_url, cat.name as category_name, b.name as branch_name, cust.name as customer_name, cust.phone as customer_phone, p.payment_status FROM rentals r JOIN cars c ON r.car_id = c.id JOIN car_categories cat ON c.category_id = cat.id JOIN branches b ON r.branch_id = b.id JOIN customers cust ON r.customer_id = cust.id LEFT JOIN payments p ON r.id = p.rental_id WHERE 1=1';

        const params = [];

        if (status) {
            query += ' AND r.status = ?';
            params.push(status);
        }

        query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        // Change from pool.execute to pool.query
        const [rentals] = await pool.query(query, params);

        // Count total
        const countQuery = 'SELECT COUNT(*) as total FROM rentals' + (status ? ' WHERE status = ?' : '');
        const countParams = status ? [status] : [];
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            success: true,
            data: rentals,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching owner bookings:', error);
        next(error);
    }
};

const getRentalById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(
            `SELECT r.*, c.brand, c.model, c.image_url, cc.name AS category_name, b.name AS branch_name
       FROM rentals r
       JOIN cars c ON r.car_id = c.id
       JOIN car_categories cc ON c.category_id = cc.id
       JOIN branches b ON c.branch_id = b.id
       WHERE r.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Rental not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error in getRentalById:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    createRental,
    getMyBookings,
    getRentalById,
    updateRentalStatus,
    returnCar,
    getOwnerBookings
};